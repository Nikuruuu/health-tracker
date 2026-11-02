import { describe, expect, it } from "vitest";
import { envSchema } from "./env";

describe("Environment Validation Schema", () => {
  const validBase = {
    DATABASE_URL: "postgresql://user:pass@ep-pooler.neon.tech/neondb?sslmode=require",
    DATABASE_URL_UNPOOLED: "postgresql://user:pass@ep-direct.neon.tech/neondb?sslmode=require",
    BETTER_AUTH_SECRET: "this-is-a-random-secret-key-that-is-at-least-32-chars-long",
    BETTER_AUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  };

  it("succeeds with valid base configuration", () => {
    const res = envSchema.safeParse(validBase);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.EMAIL_FROM).toBe("noreply@example.com");
      expect(res.data.NODE_ENV).toBe("development");
    }
  });

  it("fails when BETTER_AUTH_SECRET is shorter than 32 characters", () => {
    const res = envSchema.safeParse({
      ...validBase,
      BETTER_AUTH_SECRET: "too-short",
    });
    expect(res.success).toBe(false);
  });

  it("fails when URLs are malformed", () => {
    const res = envSchema.safeParse({
      ...validBase,
      BETTER_AUTH_URL: "not-a-valid-url",
    });
    expect(res.success).toBe(false);
  });

  it("accepts optional variables like GOOGLE_CLIENT_ID and RESEND_API_KEY", () => {
    const res = envSchema.safeParse({
      ...validBase,
      GOOGLE_CLIENT_ID: "client-id",
      GOOGLE_CLIENT_SECRET: "client-secret",
      RESEND_API_KEY: "re_12345678",
      USDA_API_KEY: "usda-key",
    });
    expect(res.success).toBe(true);
  });
});

