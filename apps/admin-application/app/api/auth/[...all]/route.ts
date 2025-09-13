import { getAuth } from '@repo/data-ops/auth';
import { initDatabase } from '@repo/data-ops/database';

async function handler(req: Request) {
  // Initialize database
  const db = (process.env as any).DB;
  if (db) {
    initDatabase(db);
  }

  // Get auth instance
  const auth = getAuth({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  });

  return auth.handler(req);
}

export { handler as GET, handler as POST };

// Configure edge runtime for Cloudflare
export const runtime = 'edge';