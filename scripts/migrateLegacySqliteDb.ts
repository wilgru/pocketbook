import { existsSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const EMPTY_LEXICAL_CONTENT = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

type LexicalNode = {
  children?: unknown;
  language?: unknown;
  type?: unknown;
  [key: string]: unknown;
};

type MigrationSummary = {
  codeBlocks: number;
  contentRows: number;
};

const usage = (): never => {
  throw new Error(
    "Usage: npx tsx scripts/migrateLegacySqliteDb.ts --db-path=/absolute/path/to/pocketbook.db --apply",
  );
};

const getArgumentValue = (name: string): string | undefined =>
  process.argv
    .slice(2)
    .find((argument) => argument.startsWith(`${name}=`))
    ?.slice(name.length + 1);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const migrateCodeBlocks = (node: LexicalNode): number => {
  let codeBlocks = 0;

  if (node.type === "code") {
    codeBlocks += 1;

    if (
      typeof node.language !== "string" ||
      node.language.trim().length === 0
    ) {
      node.language = "javascript";
    }

    if (Array.isArray(node.children)) {
      node.children = node.children.flatMap((child) => {
        if (!isRecord(child) || child.type !== "text") {
          return [child];
        }

        const { text, ...properties } = child;
        const textValue = typeof text === "string" ? text : "";
        const lines = textValue.split("\n");

        return lines.flatMap((line, index) => {
          const highlightedNode = {
            ...properties,
            highlightType: null,
            text: line,
            type: "code-highlight",
          };

          return index === lines.length - 1
            ? [highlightedNode]
            : [highlightedNode, { type: "linebreak", version: 1 }];
        });
      });
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (isRecord(child)) {
        codeBlocks += migrateCodeBlocks(child);
      }
    }
  }

  return codeBlocks;
};

const migrateLexicalContent = (
  content: string,
): { content: string; codeBlocks: number } => {
  const parsed: unknown = JSON.parse(content);

  if (!isRecord(parsed) || !isRecord(parsed.root)) {
    return { content, codeBlocks: 0 };
  }

  const codeBlocks = migrateCodeBlocks(parsed.root);

  return { content: JSON.stringify(parsed), codeBlocks };
};

const getColumnNames = (sqlite: Database.Database, table: string): string[] =>
  sqlite
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((column) => (column as { name: string }).name);

const assertLegacySchema = (sqlite: Database.Database): void => {
  const tableNames = new Set(
    sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('notes', 'comments', 'tag_groups')",
      )
      .all()
      .map((table) => (table as { name: string }).name),
  );

  if (
    !tableNames.has("notes") ||
    !tableNames.has("comments") ||
    !tableNames.has("tag_groups")
  ) {
    throw new Error(
      "The database does not contain the legacy Pocketbook tables required for this migration.",
    );
  }

  const noteColumns = new Set(getColumnNames(sqlite, "notes"));

  if (!noteColumns.has("user")) {
    throw new Error(
      "The database is not from before commit 1d648b081da1ae8feeca0180a558a00aa4eac126, or it has already been migrated.",
    );
  }

  const notesWithoutPocketbook = sqlite
    .prepare("SELECT COUNT(*) AS count FROM notes WHERE pocketbook IS NULL")
    .get() as { count: number };

  if (notesWithoutPocketbook.count > 0) {
    throw new Error(
      `Cannot migrate ${notesWithoutPocketbook.count} note(s) without a pocketbook. Assign each note to a pocketbook before retrying.`,
    );
  }
};

const normalizeNullableContent = (sqlite: Database.Database): void => {
  sqlite
    .prepare("UPDATE notes SET content = ? WHERE content IS NULL")
    .run(EMPTY_LEXICAL_CONTENT);
  sqlite
    .prepare("UPDATE comments SET content = ? WHERE content IS NULL")
    .run(EMPTY_LEXICAL_CONTENT);
};

const migrateStoredContent = (
  sqlite: Database.Database,
  table: "notes" | "comments",
): MigrationSummary => {
  const rows = sqlite
    .prepare(`SELECT id, content FROM ${table}`)
    .all() as Array<{ id: string; content: string }>;
  const update = sqlite.prepare(`UPDATE ${table} SET content = ? WHERE id = ?`);
  let codeBlocks = 0;
  let contentRows = 0;

  const updateContent = sqlite.transaction(() => {
    for (const row of rows) {
      const migration = migrateLexicalContent(row.content);

      if (migration.codeBlocks > 0) {
        update.run(migration.content, row.id);
        contentRows += 1;
        codeBlocks += migration.codeBlocks;
      }
    }
  });

  updateContent();

  return { codeBlocks, contentRows };
};

const dbPath = getArgumentValue("--db-path");

if (!dbPath || !process.argv.includes("--apply")) {
  usage();
}

const resolvedDbPath = path.resolve(dbPath);

if (!existsSync(resolvedDbPath)) {
  throw new Error(`SQLite database file does not exist: ${resolvedDbPath}`);
}

const sqlite = new Database(resolvedDbPath);

try {
  sqlite.pragma("foreign_keys = ON");
  assertLegacySchema(sqlite);
  normalizeNullableContent(sqlite);

  migrate(drizzle(sqlite), {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });

  const noteSummary = migrateStoredContent(sqlite, "notes");
  const commentSummary = migrateStoredContent(sqlite, "comments");

  console.log(
    `Migrated ${resolvedDbPath}: ${noteSummary.contentRows} note(s) and ${commentSummary.contentRows} comment(s) updated; ${noteSummary.codeBlocks + commentSummary.codeBlocks} code block(s) converted.`,
  );
} finally {
  sqlite.close();
}
