import { z } from 'zod';
import { adminProcedure, router } from '../trpc';
import { initDatabase } from '@repo/data-ops/database';
import { clicks, links, users } from '@repo/data-ops/schema';
import { desc, sql, and, gte, lte } from 'drizzle-orm';

export const analyticsRouter = router({
  overview: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      
      // Get date range (default to last 30 days)
      const endDate = input?.endDate || new Date();
      const startDate = input?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Total links
      const totalLinks = await db
        .select({ count: links.id })
        .from(links)
        .then(result => result[0]?.count || 0);

      // Total clicks in period
      const totalClicks = await db
        .select({ count: clicks.id })
        .from(clicks)
        .where(
          and(
            gte(clicks.created_at, startDate),
            lte(clicks.created_at, endDate)
          )
        )
        .then(result => result[0]?.count || 0);

      // Total users
      const totalUsers = await db
        .select({ count: users.id })
        .from(users)
        .then(result => result[0]?.count || 0);

      // Active links (links with clicks in period)
      const activeLinks = await db
        .selectDistinct({ linkId: clicks.link_id })
        .from(clicks)
        .where(
          and(
            gte(clicks.created_at, startDate),
            lte(clicks.created_at, endDate)
          )
        )
        .then(result => result.length);

      return {
        totalLinks,
        totalClicks,
        totalUsers,
        activeLinks,
        period: {
          start: startDate,
          end: endDate,
        },
      };
    }),

  clicksByDay: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Group clicks by day
      const clicksByDay = await db
        .select({
          date: sql<string>`DATE(${clicks.created_at})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(clicks)
        .where(gte(clicks.created_at, startDate))
        .groupBy(sql`DATE(${clicks.created_at})`)
        .orderBy(sql`DATE(${clicks.created_at})`);

      return clicksByDay;
    }),

  topLinks: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Get top links by click count
      const topLinks = await db
        .select({
          linkId: clicks.link_id,
          slug: links.slug,
          destination: links.url,
          clickCount: sql<number>`COUNT(${clicks.id})`,
        })
        .from(clicks)
        .leftJoin(links, eq(clicks.link_id, links.id))
        .where(gte(clicks.created_at, startDate))
        .groupBy(clicks.link_id, links.slug, links.url)
        .orderBy(desc(sql`COUNT(${clicks.id})`))
        .limit(input.limit);

      return topLinks;
    }),

  topCountries: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Get top countries by click count
      const topCountries = await db
        .select({
          country: clicks.country,
          count: sql<number>`COUNT(*)`,
        })
        .from(clicks)
        .where(
          and(
            gte(clicks.created_at, startDate),
            sql`${clicks.country} IS NOT NULL`
          )
        )
        .groupBy(clicks.country)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(input.limit);

      return topCountries;
    }),

  userActivity: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      const startDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      // Get user's links
      const userLinks = await db
        .select()
        .from(links)
        .where(eq(links.created_by, input.userId));

      // Get click counts for user's links
      const linkIds = userLinks.map(l => l.id);
      const clickCounts = linkIds.length > 0 ? await db
        .select({
          linkId: clicks.link_id,
          count: sql<number>`COUNT(*)`,
        })
        .from(clicks)
        .where(
          and(
            sql`${clicks.link_id} IN (${linkIds.join(',')})`,
            gte(clicks.created_at, startDate)
          )
        )
        .groupBy(clicks.link_id) : [];

      return {
        totalLinks: userLinks.length,
        linkDetails: userLinks.map(link => ({
          ...link,
          clicks: clickCounts.find(c => c.linkId === link.id)?.count || 0,
        })),
      };
    }),
});

// Helper to import eq if not already imported
import { eq } from 'drizzle-orm';