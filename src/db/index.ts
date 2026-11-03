import "server-only";
import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);

// Standard HTTP driver for one-shot queries
export const db = drizzle(sql, {
  schema,
});

let poolInstance: Pool | undefined;

export function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({ connectionString: env.DATABASE_URL });
  }
  return poolInstance;
}

/**
 * Execute operations inside a database transaction using Neon's pooled WebSocket driver
 * per docs/data-model.md conventions.
 */
export async function withTransaction<T>(
  callback: (tx: Parameters<Parameters<ReturnType<typeof drizzleServerless>["transaction"]>[0]>[0]) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const poolDb = drizzleServerless(pool, { schema });
  return await poolDb.transaction(callback);
}
