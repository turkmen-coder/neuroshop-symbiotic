import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../db";
import {
  coreMemory,
  recallMemory,
  archivalMemory,
  conversationContext,
  userMaturityLevel,
  CoreMemory,
  RecallMemory,
  ArchivalMemory,
} from "../../drizzle/schema";

/**
 * Agentic Memory Service
 * Manages Core, Recall, and Archival memory layers
 */
export class MemoryService {
  /**
   * Initialize core memory for a new user
   */
  async initializeCoreMemory(userId: number): Promise<CoreMemory> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await db.select().from(coreMemory).where(eq(coreMemory.userId, userId)).limit(1);

    if (existing.length > 0) {
      return existing[0]!;
    }

    const [newMemory] = await db.insert(coreMemory).values({
      userId,
      relationshipState: "stranger",
      trustScore: 0,
      activeGoals: [],
      favoriteCategories: [],
      idiosyncrasies: [],
    });

    const [created] = await db.select().from(coreMemory).where(eq(coreMemory.userId, userId)).limit(1);
    return created!;
  }

  /**
   * Get core memory for a user
   */
  async getCoreMemory(userId: number): Promise<CoreMemory | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db.select().from(coreMemory).where(eq(coreMemory.userId, userId)).limit(1);

    return result.length > 0 ? result[0]! : null;
  }

  /**
   * Update core memory
   */
  async updateCoreMemory(
    userId: number,
    updates: Partial<Omit<CoreMemory, "id" | "userId" | "createdAt" | "updatedAt">>
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.update(coreMemory).set(updates).where(eq(coreMemory.userId, userId));
  }

  /**
   * Add a goal to core memory
   */
  async addGoal(userId: number, goal: string, priority: number = 5): Promise<void> {
    const memory = await this.getCoreMemory(userId);
    if (!memory) {
      await this.initializeCoreMemory(userId);
    }

    const currentGoals = memory?.activeGoals || [];
    const updatedGoals = [...currentGoals, goal];

    await this.updateCoreMemory(userId, {
      activeGoals: updatedGoals,
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: number,
    preferences: {
      priceRange?: { min: number; max: number };
      favoriteCategories?: string[];
      idiosyncrasies?: string[];
    }
  ): Promise<void> {
    await this.updateCoreMemory(userId, preferences);
  }

  /**
   * Add recall memory (recent interaction)
   */
  async addRecallMemory(
    userId: number,
    eventType: "search_query" | "product_view" | "product_reject" | "product_approve" | "canvas_action" | "chat_message",
    eventData: Record<string, any>
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(recallMemory).values({
      userId,
      eventType,
      eventData,
    });
  }

  /**
   * Get recent recall memories
   */
  async getRecentRecallMemories(userId: number, limit: number = 10): Promise<RecallMemory[]> {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(recallMemory).where(eq(recallMemory.userId, userId)).orderBy(desc(recallMemory.timestamp)).limit(limit);
  }

  /**
   * Add archival memory (long-term)
   */
  async addArchivalMemory(
    userId: number,
    content: string,
    category?: string,
    importance: number = 5
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(archivalMemory).values({
      userId,
      content,
      category,
      importance,
    });
  }

  /**
   * Search archival memory
   */
  async searchArchivalMemory(userId: number, category?: string, limit: number = 20): Promise<ArchivalMemory[]> {
    const db = await getDb();
    if (!db) return [];

    if (category) {
      return db
        .select()
        .from(archivalMemory)
        .where(and(eq(archivalMemory.userId, userId), eq(archivalMemory.category, category)))
        .orderBy(desc(archivalMemory.importance))
        .limit(limit);
    }

    return db
      .select()
      .from(archivalMemory)
      .where(eq(archivalMemory.userId, userId))
      .orderBy(desc(archivalMemory.importance))
      .limit(limit);
  }

  /**
   * Get full memory context for AI
   */
  async getFullContext(userId: number): Promise<{
    core: CoreMemory | null;
    recentInteractions: RecallMemory[];
    archival: ArchivalMemory[];
  }> {
    const [core, recentInteractions, archival] = await Promise.all([
      this.getCoreMemory(userId),
      this.getRecentRecallMemories(userId, 10),
      this.searchArchivalMemory(userId, undefined, 5),
    ]);

    return {
      core,
      recentInteractions,
      archival,
    };
  }

  /**
   * Update relationship state based on interactions
   */
  async updateRelationshipState(userId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const interactionCount = await db
      .select()
      .from(recallMemory)
      .where(eq(recallMemory.userId, userId));

    const count = interactionCount.length;
    let newState: "stranger" | "acquaintance" | "partner" = "stranger";

    if (count > 50) {
      newState = "partner";
    } else if (count > 10) {
      newState = "acquaintance";
    }

    await this.updateCoreMemory(userId, {
      relationshipState: newState,
    });
  }

  /**
   * Consolidate memories (move important recall to archival)
   */
  async consolidateMemories(userId: number): Promise<void> {
    const recentMemories = await this.getRecentRecallMemories(userId, 50);

    // Simple consolidation: move product approvals to archival
    for (const memory of recentMemories) {
      if (memory.eventType === "product_approve") {
        const content = `User approved product: ${JSON.stringify(memory.eventData)}`;
        await this.addArchivalMemory(userId, content, "product_preference", 7);
      }
    }

    await this.updateRelationshipState(userId);
  }

  /**
   * Get or create maturity level
   */
  async getMaturityLevel(userId: number): Promise<"tool" | "copilot" | "partner"> {
    const db = await getDb();
    if (!db) return "tool";

    const result = await db.select().from(userMaturityLevel).where(eq(userMaturityLevel.userId, userId)).limit(1);

    if (result.length === 0) {
      await db.insert(userMaturityLevel).values({
        userId,
        currentLevel: "tool",
        interactionCount: 0,
      });
      return "tool";
    }

    return result[0]!.currentLevel;
  }

  /**
   * Increment interaction count and update maturity level
   */
  async incrementInteraction(userId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const current = await db.select().from(userMaturityLevel).where(eq(userMaturityLevel.userId, userId)).limit(1);

    if (current.length === 0) {
      await db.insert(userMaturityLevel).values({
        userId,
        currentLevel: "tool",
        interactionCount: 1,
      });
      return;
    }

    const newCount = current[0]!.interactionCount + 1;
    let newLevel: "tool" | "copilot" | "partner" = current[0]!.currentLevel;

    if (newCount > 100) {
      newLevel = "partner";
    } else if (newCount > 20) {
      newLevel = "copilot";
    }

    await db
      .update(userMaturityLevel)
      .set({
        interactionCount: newCount,
        currentLevel: newLevel,
      })
      .where(eq(userMaturityLevel.userId, userId));
  }
}

export const memoryService = new MemoryService();
