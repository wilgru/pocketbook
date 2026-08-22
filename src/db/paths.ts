import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const APP_DIR_NAME = "Pocketbook";

/**
 * Runtime-agnostic filesystem locations for the database and its migrations.
 *
 * This module deliberately avoids importing `electron` so that the data layer
 * can run under Electron, plain Node, or Deno. Electron-specific values are
 * read from `process` (which Electron augments at runtime) rather than from the
 * `electron` module, and every location can be overridden with an environment
 * variable so an embedding runtime can inject its own paths.
 */

type MaybeElectronProcess = NodeJS.Process & {
  /** Set by Electron when running an unpackaged app via the `electron` binary. */
  defaultApp?: boolean;
  /** Set by Electron to the packaged app's `resources` directory. */
  resourcesPath?: string;
};

const runtimeProcess = process as MaybeElectronProcess;

const isElectron = !!runtimeProcess.versions?.electron;

/**
 * Equivalent to Electron's `app.isPackaged`, which is itself derived from
 * `process.defaultApp`. Checking `process` directly keeps this module free of
 * an `electron` import.
 */
export const isPackaged = isElectron && !runtimeProcess.defaultApp;

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
 * Override with `POCKETBOOK_MIGRATIONS_DIR`.
 */
export function getMigrationsDirectory(): string {
  const override = runtimeProcess.env.POCKETBOOK_MIGRATIONS_DIR;
  if (override) {
    return override;
  }

  // When packaged, migrations ship as an `extraResource` alongside the app.
  if (isPackaged && runtimeProcess.resourcesPath) {
    return path.join(runtimeProcess.resourcesPath, "drizzle");
  }

  return path.join(runtimeProcess.cwd(), "drizzle");
}
