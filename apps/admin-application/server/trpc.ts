import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { z } from 'zod';
import { getAuth } from '@repo/data-ops/auth';

export interface CloudflareEnv {
  DB: D1Database;
  BACKEND_SERVICE: Fetcher;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

interface Context {
  env: CloudflareEnv;
  userId?: string;
  isAdmin?: boolean;
}

export async function createContext(opts: FetchCreateContextFnOptions & { env: CloudflareEnv }): Promise<Context> {
  const auth = getAuth({
    clientId: opts.env.GOOGLE_CLIENT_ID,
    clientSecret: opts.env.GOOGLE_CLIENT_SECRET,
  });

  const session = await auth.api.getSession({ headers: opts.req.headers });
  
  // For admin application, we should verify admin role
  // This is a placeholder - you'll need to implement admin role checking
  const isAdmin = session?.user ? true : false; // TODO: Check actual admin role from DB

  return {
    env: opts.env,
    userId: session?.user?.id,
    isAdmin,
  };
}

const t = initTRPC.context<Context>().create({
  transformer: undefined, // Using plain JSON for Cloudflare compatibility
});

// Middleware to ensure user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

// Middleware to ensure user is admin
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      isAdmin: true,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);