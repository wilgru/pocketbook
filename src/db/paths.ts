import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const APP_DIR_NAME = "Pocketbook";

/**
 * Runtime-agnostic filesystem locations for the database and its migrations.
 *
 * The data layer runs inside the Deno desktop process, but is also loaded by
 * plain Node tooling (the dev seed script). Nothing here depends on a specific
 * runtime: locations are derived from `process` and can be overridden with
 * environment variables so an embedding runtime can inject its own paths.
 */

const runtimeProcess = process;

/**
 * Whether the app is running from a packaged build rather than a dev checkout.
 *
 * Packaged builds have no reliable ambient signal, so the desktop entrypoint
 * declares it explicitly with `POCKETBOOK_PACKAGED`.
 */
export const isPackaged = runtimeProcess.env.POCKETBOOK_PACKAGED === "1";

function getUserDataDirectory(): string {
  const platform = runtimeProcess.platform;

  if (platform === "darwin") {
    return path.join(homedir(), "Library", "Application Support", APP_DIR_NAME);
  }

  if (platform === "win32") {
    return path.join(
      runtimeProcess.env.APPDATA ?? path.join(homedir(), "AppData", "Roaming"),
      APP_DIR_NAME,
    );
  }

  return path.join(
    runtimeProcess.env.XDG_DATA_HOME ?? path.join(homedir(), ".local", "share"),
    APP_DIR_NAME,
  );
}

/** Directory holding the development database, always at the project root. */
export function getDevDatabaseDirectory(): string {
  return path.join(runtimeProcess.cwd(), "dev-db");
}

/**
 * Resolves the SQLite file to open, creating its parent directory if needed.
 *
 * Override with `POCKETBOOK_DB_PATH`.
 */
export function getDatabasePath(): string {
  const override = runtimeProcess.env.POCKETBOOK_DB_PATH;
  if (override) {
    mkdirSync(path.dirname(override), { recursive: true });
    return override;
  }

  const directory = isPackaged
    ? getUserDataDirectory()
    : getDevDatabaseDirectory();

  mkdirSync(directory, { recursive: true });
  return path.join(directory, "pocketbook.db");
}

/**
 * Resolves the Drizzle migrations folder.
 *
 * Override with `POCKETBOOK_MIGRATIONS_DIR`, which the desktop entrypoint sets
 * so migrations are found inside the packaged bundle.
 */
export function getMigrationsDirectory(): string {
  return (
    runtimeProcess.env.POCKETBOOK_MIGRATIONS_DIR ??
    path.join(runtimeProcess.cwd(), "drizzle")
  );
}
