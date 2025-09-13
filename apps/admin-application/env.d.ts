/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Cloudflare bindings
      DB: D1Database;
      BACKEND_SERVICE: Fetcher;
      
      // Environment variables
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      BETTER_AUTH_SECRET: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};