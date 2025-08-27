import { createBetterAuth } from "@/auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";


type AuthType = ReturnType<typeof createBetterAuth>;

export const auth: AuthType = createBetterAuth(drizzleAdapter(
  {},
  {
    provider: "sqlite"
  }
))
