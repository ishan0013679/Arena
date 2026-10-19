// Server-side only. Never import this from client components.
// DATABASE_URL must never be exposed to the browser.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  if (!_db) {
    const sql = postgres(url, { max: 5, prepare: false });
    _db = drizzle({ client: sql, relations: schema.relations });
  }

  return _db;
}

// Export a proxy that lazily initializes on first access.
// Usage: import { db } from "@/lib/db"; await db.select().from(users);
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
