import { router } from './trpc';
import { usersRouter } from './routers/users';
import { analyticsRouter } from './routers/analytics';
import { systemRouter } from './routers/system';

export const appRouter = router({
  users: usersRouter,
  analytics: analyticsRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;