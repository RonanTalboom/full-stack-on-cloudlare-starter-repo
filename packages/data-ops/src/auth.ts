import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import { account, session, user, verification } from "./drizzle-out/auth-schema";

type AuthInstance = ReturnType<typeof betterAuth>;

let auth: AuthInstance;

export function createBetterAuth(
    database: BetterAuthOptions["database"],
    google?: { clientId: string; clientSecret: string },
  ): AuthInstance {
    return betterAuth({
      database,
      emailAndPassword: {
        enabled: false,
      },
      socialProviders: {
        google: {
          clientId: google?.clientId ?? "",
          clientSecret: google?.clientSecret ?? "",
        },
      },
    });
  }


export function getAuth(google: { clientId: string; clientSecret: string }): AuthInstance {
    if (auth) return auth;
  
    auth = createBetterAuth(
      drizzleAdapter(getDb(), {
        provider: "sqlite",
        schema: {
          user,
          session,
          account,
          verification
        }
      }),
      google,
    );
    return auth;
}
