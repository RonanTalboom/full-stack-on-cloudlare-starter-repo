import { z } from 'zod';
import { adminProcedure, router } from '../trpc';
import { initDatabase } from '@repo/data-ops/database';
import { users } from '@repo/data-ops/schema';
import { eq, desc } from 'drizzle-orm';

export const usersRouter = router({
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      
      const usersList = await db
        .select()
        .from(users)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(users.created_at));

      const totalCount = await db
        .select({ count: users.id })
        .from(users)
        .then(result => result[0]?.count || 0);

      return {
        users: usersList,
        totalCount,
        hasMore: input.offset + input.limit < totalCount,
      };
    }),

  getById: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input))
        .limit(1);

      if (!user[0]) {
        throw new Error('User not found');
      }

      return user[0];
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(['user', 'admin']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      
      const updatedUser = await db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          // Note: role field would need to be added to your schema
          updated_at: new Date(),
        })
        .where(eq(users.id, input.id))
        .returning();

      return updatedUser[0];
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const db = initDatabase(ctx.env.DB);
      
      await db
        .delete(users)
        .where(eq(users.id, input));

      return { success: true };
    }),

  stats: adminProcedure
    .query(async ({ ctx }) => {
      const db = initDatabase(ctx.env.DB);
      
      const totalUsers = await db
        .select({ count: users.id })
        .from(users)
        .then(result => result[0]?.count || 0);

      // You can add more stats here like active users, new users this month, etc.
      
      return {
        totalUsers,
        // activeUsers: 0, // Implement based on your needs
        // newUsersThisMonth: 0,
      };
    }),
});