import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ========================================
 * AGENTIC MEMORY SYSTEM
 * ========================================
 */

/**
 * Core Memory - Çekirdek bellek (hedefler, tercihler, kişilik)
 */
export const coreMemory = mysqlTable("core_memory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  relationshipState: mysqlEnum("relationship_state", ["stranger", "acquaintance", "partner"]).default("stranger").notNull(),
  trustScore: int("trust_score").default(0).notNull(), // 0-100
  activeGoals: json("active_goals").$type<string[]>().notNull(), // ["Find laptop", "Save money"]
  priceRange: json("price_range").$type<{ min: number; max: number } | null>(),
  favoriteCategories: json("favorite_categories").$type<string[]>().notNull(),
  idiosyncrasies: json("idiosyncrasies").$type<string[]>().notNull(), // Kişisel tuhaflıklar
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

/**
 * Recall Memory - Hatırlama belleği (son etkileşimler)
 */
export const recallMemory = mysqlTable("recall_memory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  eventType: mysqlEnum("event_type", ["search_query", "product_view", "product_reject", "product_approve", "canvas_action", "chat_message"]).notNull(),
  eventData: json("event_data").$type<Record<string, any>>().notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userTimestampIdx: index("user_timestamp_idx").on(table.userId, table.timestamp),
}));

/**
 * Archival Memory - Arşiv belleği (uzun dönem, semantic search)
 */
export const archivalMemory = mysqlTable("archival_memory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  content: text("content").notNull(),
  embedding: json("embedding").$type<number[]>(), // Vector embedding for semantic search
  category: varchar("category", { length: 64 }),
  importance: int("importance").default(5).notNull(), // 1-10
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userCategoryIdx: index("user_category_idx").on(table.userId, table.category),
}));

/**
 * Conversation Context - Sohbet bağlamı
 */
export const conversationContext = mysqlTable("conversation_context", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  messages: json("messages").$type<Array<{ role: string; content: string; timestamp: number }>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userSessionIdx: index("user_session_idx").on(table.userId, table.sessionId),
}));

/**
 * User Maturity Level - Olgunluk seviyesi (Level 1-3)
 */
export const userMaturityLevel = mysqlTable("user_maturity_level", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  currentLevel: mysqlEnum("current_level", ["tool", "copilot", "partner"]).default("tool").notNull(),
  interactionCount: int("interaction_count").default(0).notNull(),
  lastLevelChange: timestamp("last_level_change").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * ========================================
 * PERSONALITY & BEHAVIOR
 * ========================================
 */

/**
 * User Personality Profiles - Big Five kişilik profilleri
 */
export const userPersonalityProfiles = mysqlTable("user_personality_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  openness: int("openness").default(50).notNull(), // 0-100
  conscientiousness: int("conscientiousness").default(50).notNull(),
  extraversion: int("extraversion").default(50).notNull(),
  agreeableness: int("agreeableness").default(50).notNull(),
  neuroticism: int("neuroticism").default(50).notNull(),
  dominantTrait: varchar("dominant_trait", { length: 64 }),
  lastAnalyzed: timestamp("last_analyzed").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Behavior Metrics - Davranış metrikleri
 */
export const behaviorMetrics = mysqlTable("behavior_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  clickSpeed: float("click_speed"), // ms between clicks
  scrollDepth: float("scroll_depth"), // percentage
  hoverDuration: float("hover_duration"), // average ms
  productViewTime: float("product_view_time"), // average seconds
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userSessionIdx: index("user_session_idx").on(table.userId, table.sessionId),
}));

/**
 * ========================================
 * PRICE TRACKING
 * ========================================
 */

/**
 * Price Watch List - Takip edilen ürünler
 */
export const priceWatchList = mysqlTable("price_watch_list", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  currentPrice: float("current_price").notNull(),
  targetPrice: float("target_price"),
  source: varchar("source", { length: 128 }),
  imageUrl: text("image_url"),
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userActiveIdx: index("user_active_idx").on(table.userId, table.isActive),
}));

/**
 * Price History - Fiyat değişim geçmişi
 */
export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  watchListId: int("watch_list_id").notNull(),
  price: float("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  watchListTimestampIdx: index("watch_list_timestamp_idx").on(table.watchListId, table.timestamp),
}));

/**
 * Price Alerts - Fiyat bildirimleri
 */
export const priceAlerts = mysqlTable("price_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  watchListId: int("watch_list_id").notNull(),
  alertType: mysqlEnum("alert_type", ["target_reached", "significant_drop", "lowest_ever", "trust_warning", "budget_conflict"]).notNull(),
  oldPrice: float("old_price"),
  newPrice: float("new_price").notNull(),
  reasoning: text("reasoning"), // XAI gerekçesi
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  userResponse: mysqlEnum("user_response", ["pending", "accepted", "rejected", "ignored"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
}, (table) => ({
  userResponseIdx: index("user_response_idx").on(table.userId, table.userResponse),
}));

/**
 * Price Predictions - Fiyat tahminleri
 */
export const pricePredictions = mysqlTable("price_predictions", {
  id: int("id").autoincrement().primaryKey(),
  watchListId: int("watch_list_id").notNull(),
  predictedPrice: float("predicted_price").notNull(),
  confidence: float("confidence").notNull(), // 0-1
  timeframe: varchar("timeframe", { length: 32 }).notNull(), // "1_week", "1_month"
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Conditional Delegations - Koşullu yetkilendirmeler
 */
export const conditionalDelegations = mysqlTable("conditional_delegations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  watchListId: int("watch_list_id").notNull(),
  condition: text("condition").notNull(), // "price < 7000"
  action: mysqlEnum("action", ["notify", "reserve", "auto_buy"]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  executedAt: timestamp("executed_at"),
}, (table) => ({
  userActiveIdx: index("user_active_idx").on(table.userId, table.isActive),
}));

/**
 * Budget Tracking - Bütçe takibi
 */
export const budgetTracking = mysqlTable("budget_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  monthlyBudget: float("monthly_budget").notNull(),
  currentSpending: float("current_spending").default(0).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // "2025-01"
  alertThreshold: float("alert_threshold").default(0.8).notNull(), // 80%
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userMonthIdx: index("user_month_idx").on(table.userId, table.month),
}));

/**
 * ========================================
 * SPATIAL CANVAS & XAI
 * ========================================
 */

/**
 * Canvas Artifacts - Spatial Canvas öğeleri
 */
export const canvasArtifacts = mysqlTable("canvas_artifacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  artifactType: mysqlEnum("artifact_type", ["product", "research_result", "note", "comparison"]).notNull(),
  title: text("title").notNull(),
  content: json("content").$type<Record<string, any>>().notNull(),
  positionX: float("position_x").default(0).notNull(),
  positionY: float("position_y").default(0).notNull(),
  width: float("width").default(300).notNull(),
  height: float("height").default(200).notNull(),
  zIndex: int("z_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

/**
 * Recommendation Explanations - XAI reasoning traces
 */
export const recommendationExplanations = mysqlTable("recommendation_explanations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  productId: varchar("product_id", { length: 128 }),
  score: int("score").notNull(), // 0-100
  reasoning: json("reasoning").$type<Array<{
    step: number;
    factor: string;
    evidence: string;
    weight: number;
  }>>().notNull(),
  userFeedback: mysqlEnum("user_feedback", ["helpful", "not_helpful", "misleading"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userProductIdx: index("user_product_idx").on(table.userId, table.productId),
}));

/**
 * Action Guards - Onay mekanizmaları
 */
export const actionGuards = mysqlTable("action_guards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  guardType: mysqlEnum("guard_type", ["high_value_purchase", "impulse_detected", "ethical_concern", "pattern_deviation", "ai_low_confidence"]).notNull(),
  triggerCondition: text("trigger_condition").notNull(),
  promptMessage: text("prompt_message").notNull(),
  requiredAction: mysqlEnum("required_action", ["confirmation", "reasoning_prompt", "cooling_period", "budget_review"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "expired"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => ({
  userStatusIdx: index("user_status_idx").on(table.userId, table.status),
}));

export type CoreMemory = typeof coreMemory.$inferSelect;
export type RecallMemory = typeof recallMemory.$inferSelect;
export type ArchivalMemory = typeof archivalMemory.$inferSelect;
export type ConversationContext = typeof conversationContext.$inferSelect;
export type UserMaturityLevel = typeof userMaturityLevel.$inferSelect;
export type UserPersonalityProfile = typeof userPersonalityProfiles.$inferSelect;
export type BehaviorMetric = typeof behaviorMetrics.$inferSelect;
export type PriceWatchListItem = typeof priceWatchList.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type PricePrediction = typeof pricePredictions.$inferSelect;
export type ConditionalDelegation = typeof conditionalDelegations.$inferSelect;
export type BudgetTracking = typeof budgetTracking.$inferSelect;
export type CanvasArtifact = typeof canvasArtifacts.$inferSelect;
export type RecommendationExplanation = typeof recommendationExplanations.$inferSelect;
export type ActionGuard = typeof actionGuards.$inferSelect;
