// import "server-only";
import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_UNPOOLED: z.string().min(1, "DATABASE_URL_UNPOOLED is required"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email").optional().default("noreply@example.com"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  USDA_API_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(data: unknown = process.env): Env {
  const parsed = envSchema.safeParse(data);
  if (!parsed.success) {
    const formatted = parsed.error.format();
    console.error("❌ Invalid environment variables:", formatted);
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
    );
  }
  return parsed.data;
}

let cachedEnv: Env | undefined;

export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== "string") {
      return undefined;
    }
    if (process.env.SKIP_ENV_VALIDATION === "true") {
      return process.env[prop];
    }
    if (!cachedEnv) {
      cachedEnv = validateEnv(process.env);
    }
    return cachedEnv[prop as keyof Env];
  },
});

