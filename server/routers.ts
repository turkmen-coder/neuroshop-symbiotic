import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { memoryService } from "./services/memory";
import { priceTrackingService } from "./services/priceTracking";
import { ollamaService } from "./services/ollama";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Memory Router - Agentic Memory System
   */
  memory: router({
    getContext: protectedProcedure.query(async ({ ctx }) => {
      return memoryService.getFullContext(ctx.user.id);
    }),

    getCoreMemory: protectedProcedure.query(async ({ ctx }) => {
      return memoryService.getCoreMemory(ctx.user.id);
    }),

    addGoal: protectedProcedure
      .input(
        z.object({
          goal: z.string(),
          priority: z.number().min(1).max(10).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await memoryService.addGoal(ctx.user.id, input.goal, input.priority);
        return { success: true };
      }),

    updatePreferences: protectedProcedure
      .input(
        z.object({
          priceRange: z.object({ min: z.number(), max: z.number() }).optional(),
          favoriteCategories: z.array(z.string()).optional(),
          idiosyncrasies: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await memoryService.updatePreferences(ctx.user.id, input);
        return { success: true };
      }),

    addRecallMemory: protectedProcedure
      .input(
        z.object({
          eventType: z.enum(["search_query", "product_view", "product_reject", "product_approve", "canvas_action", "chat_message"]),
          eventData: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await memoryService.addRecallMemory(ctx.user.id, input.eventType, input.eventData);
        return { success: true };
      }),

    getMaturityLevel: protectedProcedure.query(async ({ ctx }) => {
      return memoryService.getMaturityLevel(ctx.user.id);
    }),

    consolidate: protectedProcedure.mutation(async ({ ctx }) => {
      await memoryService.consolidateMemories(ctx.user.id);
      return { success: true };
    }),
  }),

  /**
   * Price Tracking Router
   */
  priceTracking: router({
    addToWatchList: protectedProcedure
      .input(
        z.object({
          url: z.string().url(),
          title: z.string(),
          currentPrice: z.number().positive(),
          targetPrice: z.number().positive().optional(),
          source: z.string().optional(),
          imageUrl: z.string().url().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = await priceTrackingService.addToWatchList(ctx.user.id, input);
        return { id, success: true };
      }),

    getWatchList: protectedProcedure
      .input(
        z.object({
          activeOnly: z.boolean().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return priceTrackingService.getWatchList(ctx.user.id, input.activeOnly);
      }),

    getPriceHistory: protectedProcedure
      .input(
        z.object({
          watchListId: z.number(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return priceTrackingService.getPriceHistory(input.watchListId, input.limit);
      }),

    getUserAlerts: protectedProcedure
      .input(
        z.object({
          status: z.enum(["pending", "accepted", "rejected", "ignored"]).optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return priceTrackingService.getUserAlerts(ctx.user.id, input.status);
      }),

    respondToAlert: protectedProcedure
      .input(
        z.object({
          alertId: z.number(),
          response: z.enum(["accepted", "rejected", "ignored"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await priceTrackingService.respondToAlert(input.alertId, input.response);
        return { success: true };
      }),

    checkPrices: protectedProcedure.mutation(async ({ ctx }) => {
      await priceTrackingService.checkPrices(ctx.user.id);
      return { success: true };
    }),

    getBudget: protectedProcedure.query(async ({ ctx }) => {
      return priceTrackingService.getBudgetTracking(ctx.user.id);
    }),

    updateBudget: protectedProcedure
      .input(
        z.object({
          monthlyBudget: z.number().positive(),
          alertThreshold: z.number().min(0).max(1).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await priceTrackingService.updateBudget(ctx.user.id, input.monthlyBudget, input.alertThreshold);
        return { success: true };
      }),
  }),

  /**
   * Ollama Router - Symbiotic AI
   */
  ollama: router({
    checkAvailability: publicProcedure.query(async () => {
      return ollamaService.checkAvailability();
    }),

    analyzeSearchQuery: protectedProcedure
      .input(
        z.object({
          query: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const memory = await memoryService.getFullContext(ctx.user.id);
        const userMemory = {
          relationshipState: memory.core?.relationshipState,
          trustScore: memory.core?.trustScore,
          activeGoals: memory.core?.activeGoals,
          priceRange: memory.core?.priceRange,
          favoriteCategories: memory.core?.favoriteCategories,
          idiosyncrasies: memory.core?.idiosyncrasies,
          recentInteractions: memory.recentInteractions.map((r) => ({
            type: r.eventType,
            data: r.eventData,
          })),
        };

        return ollamaService.analyzeSearchQuery(input.query, userMemory);
      }),

    recommendProducts: protectedProcedure
      .input(
        z.object({
          products: z.array(
            z.object({
              id: z.union([z.string(), z.number()]),
              name: z.string(),
              description: z.string().optional(),
              price: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const memory = await memoryService.getFullContext(ctx.user.id);
        const userMemory = {
          relationshipState: memory.core?.relationshipState,
          trustScore: memory.core?.trustScore,
          activeGoals: memory.core?.activeGoals,
          priceRange: memory.core?.priceRange,
          favoriteCategories: memory.core?.favoriteCategories,
          idiosyncrasies: memory.core?.idiosyncrasies,
          recentInteractions: memory.recentInteractions.map((r) => ({
            type: r.eventType,
            data: r.eventData,
          })),
        };

        return ollamaService.recommendProducts(input.products, userMemory);
      }),

    generateReasoning: protectedProcedure
      .input(
        z.object({
          productName: z.string(),
          score: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const memory = await memoryService.getFullContext(ctx.user.id);
        const userMemory = {
          relationshipState: memory.core?.relationshipState,
          trustScore: memory.core?.trustScore,
          activeGoals: memory.core?.activeGoals,
          priceRange: memory.core?.priceRange,
          favoriteCategories: memory.core?.favoriteCategories,
          idiosyncrasies: memory.core?.idiosyncrasies,
        };

        return ollamaService.generateReasoning(input.productName, input.score, userMemory);
      }),

    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          conversationHistory: z
            .array(
              z.object({
                role: z.enum(["system", "user", "assistant"]),
                content: z.string(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const memory = await memoryService.getFullContext(ctx.user.id);
        const userMemory = {
          relationshipState: memory.core?.relationshipState,
          trustScore: memory.core?.trustScore,
          activeGoals: memory.core?.activeGoals,
          priceRange: memory.core?.priceRange,
          favoriteCategories: memory.core?.favoriteCategories,
          idiosyncrasies: memory.core?.idiosyncrasies,
          recentInteractions: memory.recentInteractions.map((r) => ({
            type: r.eventType,
            data: r.eventData,
          })),
        };

        const response = await ollamaService.chat(input.message, userMemory, input.conversationHistory);

        // Save chat message to recall memory
        await memoryService.addRecallMemory(ctx.user.id, "chat_message", {
          message: input.message,
          response,
        });

        return { response };
      }),
  }),
});

export type AppRouter = typeof appRouter;
