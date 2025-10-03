import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    PRIVY_APP_SECRET: z.string(),
    CONVEX_DEPLOYMENT: z.string(),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string(),
    // LIVEKIT_API_KEY: z.string(), // LiveKit removed - using Mux instead
    // LIVEKIT_API_SECRET: z.string(), // LiveKit removed - using Mux instead
    S3_ACCESS_KEY_ID: z.string(),
    S3_ACCESS_KEY_SECRET: z.string(),
    R2_ACCOUNT_ID: z.string(),
    R2_STREAMS_BUCKET_ENDPOINT: z.string(),
    R2_STREAMS_BUCKET_NAME: z.string(),
    ALCHEMY_API_KEY: z.string(),
    ADMIN_PRIVATE_KEY: z.string(),
    API_KEY_0X: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
    // NEXT_PUBLIC_LIVEKIT_URL: z.string(), // LiveKit removed - using Mux instead
    NEXT_PUBLIC_ONCHAINKIT_API_KEY: z.string(),
    NEXT_PUBLIC_CONVEX_URL: z.url(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    // LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY, // LiveKit removed - using Mux instead
    // LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET, // LiveKit removed - using Mux instead
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_ACCESS_KEY_SECRET: process.env.S3_ACCESS_KEY_SECRET,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_STREAMS_BUCKET_ENDPOINT: process.env.R2_STREAMS_BUCKET_ENDPOINT,
    R2_STREAMS_BUCKET_NAME: process.env.R2_STREAMS_BUCKET_NAME,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
    API_KEY_0X: process.env.API_KEY_0X,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    // NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL, // LiveKit removed - using Mux instead
    NEXT_PUBLIC_ONCHAINKIT_API_KEY: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
