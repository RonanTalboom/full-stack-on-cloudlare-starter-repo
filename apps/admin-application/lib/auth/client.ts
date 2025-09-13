import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : typeof window !== 'undefined' 
      ? window.location.origin 
      : '',
});

export const { signIn, signOut, useSession } = authClient;