import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/router';
import { createContext } from '@/server/trpc';
import { getRuntime } from '@trpc/server/adapters/fetch';

const handler = async (req: Request) => {
  // Get the Cloudflare bindings from the runtime
  const runtime = getRuntime();
  
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (opts) => {
      // In production, bindings will be available in process.env
      const env = {
        DB: (process.env as any).DB,
        BACKEND_SERVICE: (process.env as any).BACKEND_SERVICE,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
      };
      
      return createContext({ ...opts, env });
    },
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };

// Configure edge runtime for Cloudflare
export const runtime = 'edge';