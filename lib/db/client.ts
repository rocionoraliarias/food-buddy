import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "dev.db");

export type AppDb = BetterSQLite3Database<typeof schema>;

function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      notes TEXT,
      neighborhood TEXT,
      city TEXT,
      country TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);
}

export function createDb(dbPath = DEFAULT_DB_PATH): AppDb {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  ensureSchema(sqlite);
  return drizzle(sqlite, { schema });
}

const globalForDb = globalThis as unknown as { db?: AppDb };

export function getDb(): AppDb {
  if (process.env.VITEST) {
    throw new Error("getDb() is not available in tests; pass a createDb() instance.");
  }
  if (!globalForDb.db) {
    globalForDb.db = createDb(process.env.DATABASE_PATH ?? DEFAULT_DB_PATH);
  }
  return globalForDb.db;
}
