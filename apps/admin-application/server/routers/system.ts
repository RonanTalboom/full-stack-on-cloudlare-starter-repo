import { z } from 'zod';
import { adminProcedure, router } from '../trpc';
import { initDatabase } from '@repo/data-ops/database';
import { links, clicks, users } from '@repo/data-ops/schema';

export const systemRouter = router({
  health: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Check database connection
        const db = initDatabase(ctx.env.DB);
        await db.select({ count: users.id }).from(users).limit(1);
        
        // Check backend service if available
        let backendStatus = 'unknown';
        try {
          const response = await ctx.env.BACKEND_SERVICE.fetch(
            new Request('https://backend/health')
          );
          backendStatus = response.ok ? 'healthy' : 'unhealthy';
        } catch (e) {
          backendStatus = 'unavailable';
        }

        return {
          status: 'healthy',
          database: 'connected',
          backend: backendStatus,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          database: 'error',
          backend: 'unknown',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  stats: adminProcedure
    .query(async ({ ctx }) => {
      const db = initDatabase(ctx.env.DB);

      const [linkCount, clickCount, userCount] = await Promise.all([
        db.select({ count: links.id }).from(links).then(r => r[0]?.count || 0),
        db.select({ count: clicks.id }).from(clicks).then(r => r[0]?.count || 0),
        db.select({ count: users.id }).from(users).then(r => r[0]?.count || 0),
      ]);

      return {
        links: linkCount,
        clicks: clickCount,
        users: userCount,
        timestamp: new Date().toISOString(),
      };
    }),

  config: adminProcedure
    .query(async ({ ctx }) => {
      // Return current system configuration
      // This could be extended to read from a config table in the database
      return {
        environment: process.env.NODE_ENV || 'development',
        features: {
          geoRouting: true,
          analytics: true,
          aiDestinationCheck: true,
        },
        limits: {
          maxLinksPerUser: 1000,
          maxClicksTracked: 100000,
          maxDestinationsPerLink: 10,
        },
      };
    }),

  updateConfig: adminProcedure
    .input(
      z.object({
        features: z.object({
          geoRouting: z.boolean().optional(),
          analytics: z.boolean().optional(),
          aiDestinationCheck: z.boolean().optional(),
        }).optional(),
        limits: z.object({
          maxLinksPerUser: z.number().optional(),
          maxClicksTracked: z.number().optional(),
          maxDestinationsPerLink: z.number().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Here you would update the configuration in your database
      // For now, we'll just return the input as if it was saved
      
      // TODO: Implement actual config storage in database
      // const db = initDatabase(ctx.env.DB);
      // await db.update(systemConfig).set(input);

      return {
        success: true,
        updatedConfig: input,
      };
    }),

  auditLog: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        userId: z.string().optional(),
        action: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // This would query an audit log table
      // For now, return mock data structure
      
      // TODO: Implement actual audit logging
      return {
        logs: [],
        total: 0,
        hasMore: false,
      };
    }),
});