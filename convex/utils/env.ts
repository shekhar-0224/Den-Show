import { z } from "zod";

const envSchema = z.object({
  PRIVY_APP_ID: z.string(),
  PRIVY_APP_SECRET: z.string(),
  MUX_TOKEN_ID: z.string(),
  MUX_TOKEN_SECRET: z.string(),
  MUX_WEBHOOK_SECRET: z.string(),
});

const createEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", z.treeifyError(e));
      throw new Error("Invalid environment variables");
    }
    throw e;
  }
};

export const env = createEnv();
