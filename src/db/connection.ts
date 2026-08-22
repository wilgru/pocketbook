import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDatabasePath, getMigrationsDirectory } from "src/db/paths";

const sqlite = new Database(getDatabasePath());
sqlite.pragma("journal_mode = WAL");

// PRAGMA foreign_keys is a no-op inside a transaction, so it must be set here
// before migrate() opens its BEGIN transaction. Migrations that recreate tables
// (drop + rename pattern) require FK enforcement to be off during the migration.
sqlite.pragma("foreign_keys = OFF");

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: getMigrationsDirectory() });

sqlite.pragma("foreign_keys = ON");

export { db };
