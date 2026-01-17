import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import {
  priceWatchList,
  priceHistory,
  priceAlerts,
  pricePredictions,
  conditionalDelegations,
  budgetTracking,
  PriceWatchListItem,
  PriceAlert,
} from "../../drizzle/schema";

/**
 * Price Tracking Service
 * Proactive 7/24 price monitoring with XAI and action guards
 */
export class PriceTrackingService {
  /**
   * Add item to watch list
   */
  async addToWatchList(
    userId: number,
    item: {
      url: string;
      title: string;
      currentPrice: number;
      targetPrice?: number;
      source?: string;
      imageUrl?: string;
    }
  ): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [result] = await db.insert(priceWatchList).values({
      userId,
      ...item,
    });

    return result.insertId;
  }

  /**
   * Get user's watch list
   */
  async getWatchList(userId: number, activeOnly: boolean = true): Promise<PriceWatchListItem[]> {
    const db = await getDb();
    if (!db) return [];

    if (activeOnly) {
      return db
        .select()
        .from(priceWatchList)
        .where(and(eq(priceWatchList.userId, userId), eq(priceWatchList.isActive, true)))
        .orderBy(desc(priceWatchList.createdAt));
    }

    return db.select().from(priceWatchList).where(eq(priceWatchList.userId, userId)).orderBy(desc(priceWatchList.createdAt));
  }

  /**
   * Update price and create history
   */
  async updatePrice(watchListId: number, newPrice: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(priceWatchList)
      .set({
        currentPrice: newPrice,
        lastChecked: new Date(),
      })
      .where(eq(priceWatchList.id, watchListId));

    await db.insert(priceHistory).values({
      watchListId,
      price: newPrice,
    });
  }

  /**
   * Get price history for an item
   */
  async getPriceHistory(watchListId: number, limit: number = 30): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(priceHistory).where(eq(priceHistory.watchListId, watchListId)).orderBy(desc(priceHistory.timestamp)).limit(limit);
  }

  /**
   * Create price alert with XAI reasoning
   */
  async createAlert(
    userId: number,
    watchListId: number,
    alertType: "target_reached" | "significant_drop" | "lowest_ever" | "trust_warning" | "budget_conflict",
    oldPrice: number | null,
    newPrice: number,
    reasoning: string,
    requiresApproval: boolean = false
  ): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [result] = await db.insert(priceAlerts).values({
      userId,
      watchListId,
      alertType,
      oldPrice,
      newPrice,
      reasoning,
      requiresApproval,
      userResponse: "pending",
    });

    return result.insertId;
  }

  /**
   * Get user alerts
   */
  async getUserAlerts(userId: number, status?: "pending" | "accepted" | "rejected" | "ignored"): Promise<PriceAlert[]> {
    const db = await getDb();
    if (!db) return [];

    if (status) {
      return db
        .select()
        .from(priceAlerts)
        .where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.userResponse, status)))
        .orderBy(desc(priceAlerts.createdAt));
    }

    return db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId)).orderBy(desc(priceAlerts.createdAt));
  }

  /**
   * Respond to alert (Human-on-the-Loop)
   */
  async respondToAlert(alertId: number, response: "accepted" | "rejected" | "ignored"): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(priceAlerts)
      .set({
        userResponse: response,
        respondedAt: new Date(),
      })
      .where(eq(priceAlerts.id, alertId));
  }

  /**
   * Check prices and generate alerts
   */
  async checkPrices(userId: number): Promise<void> {
    const watchList = await this.getWatchList(userId, true);

    for (const item of watchList) {
      // Simulate price check (in production, this would scrape the URL)
      const simulatedNewPrice = item.currentPrice * (0.9 + Math.random() * 0.2);

      if (item.targetPrice && simulatedNewPrice <= item.targetPrice) {
        await this.createAlert(
          userId,
          item.id,
          "target_reached",
          item.currentPrice,
          simulatedNewPrice,
          `Fiyat hedef seviyenize (₺${item.targetPrice.toLocaleString()}) ulaştı! Şu anda ₺${simulatedNewPrice.toLocaleString()}.`,
          true
        );
      } else if (simulatedNewPrice < item.currentPrice * 0.85) {
        await this.createAlert(
          userId,
          item.id,
          "significant_drop",
          item.currentPrice,
          simulatedNewPrice,
          `Fiyat %${((1 - simulatedNewPrice / item.currentPrice) * 100).toFixed(0)} düştü! Bu önemli bir indirim.`,
          false
        );
      }

      await this.updatePrice(item.id, simulatedNewPrice);
    }
  }

  /**
   * Create conditional delegation
   */
  async createDelegation(
    userId: number,
    watchListId: number,
    condition: string,
    action: "notify" | "reserve" | "auto_buy"
  ): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [result] = await db.insert(conditionalDelegations).values({
      userId,
      watchListId,
      condition,
      action,
      isActive: true,
    });

    return result.insertId;
  }

  /**
   * Get or create budget tracking for current month
   */
  async getBudgetTracking(userId: number): Promise<any> {
    const db = await getDb();
    if (!db) return null;

    const currentMonth = new Date().toISOString().substring(0, 7); // "2025-01"

    const existing = await db
      .select()
      .from(budgetTracking)
      .where(and(eq(budgetTracking.userId, userId), eq(budgetTracking.month, currentMonth)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    await db.insert(budgetTracking).values({
      userId,
      monthlyBudget: 10000, // Default budget
      currentSpending: 0,
      month: currentMonth,
      alertThreshold: 0.8,
    });

    const [created] = await db
      .select()
      .from(budgetTracking)
      .where(and(eq(budgetTracking.userId, userId), eq(budgetTracking.month, currentMonth)))
      .limit(1);

    return created;
  }

  /**
   * Update budget
   */
  async updateBudget(userId: number, monthlyBudget: number, alertThreshold?: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const currentMonth = new Date().toISOString().substring(0, 7);

    await db
      .update(budgetTracking)
      .set({
        monthlyBudget,
        ...(alertThreshold !== undefined && { alertThreshold }),
      })
      .where(and(eq(budgetTracking.userId, userId), eq(budgetTracking.month, currentMonth)));
  }

  /**
   * Add spending to budget
   */
  async addSpending(userId: number, amount: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const budget = await this.getBudgetTracking(userId);
    const newSpending = budget.currentSpending + amount;

    await db
      .update(budgetTracking)
      .set({
        currentSpending: newSpending,
      })
      .where(eq(budgetTracking.id, budget.id));

    // Check if threshold exceeded
    if (newSpending / budget.monthlyBudget >= budget.alertThreshold) {
      // Create budget alert (could be expanded)
      console.log(`[Budget Alert] User ${userId} exceeded ${budget.alertThreshold * 100}% of monthly budget`);
    }
  }
}

export const priceTrackingService = new PriceTrackingService();
