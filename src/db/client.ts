import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

/** Postgres connection, or undefined when DATABASE_URL isn't set (the in-memory store is used then). */
export function getDb() {
  if (!process.env.DATABASE_URL) return undefined;
  if (!db) db = drizzle(postgres(process.env.DATABASE_URL, { max: 10 }), { schema });
  return db;
}
