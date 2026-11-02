import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Explicitly load .env.local for drizzle-kit CLI tasks
config({ path: ".env.local" });

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error("DATABASE_URL_UNPOOLED is missing in .env.local for migrations.");
}

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
