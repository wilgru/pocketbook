import Database from "better-sqlite3";

type QuillOpAttributes = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  script?: "sub" | "super";
  list?: "bullet" | "ordered";
  blockquote?: boolean;
  "code-block"?: boolean;
};

type QuillDelta = {
  ops: Array<{
    insert: string | Record<string, unknown>;
    attributes?: QuillOpAttributes;
  }>;
};

type LexicalTextNode = {
  detail: number;
  format: number;
  mode: "normal";
  style: string;
  text: string;
  type: "text";
  version: 1;
};

type LexicalParagraphNode = {
  children: LexicalTextNode[];
  direction: null;
  format: "";
  indent: 0;
  textFormat: 0;
  textStyle: "";
  type: "paragraph";
  version: 1;
};

type LexicalEditorState = {
  root: {
    children: LexicalParagraphNode[];
    direction: null;
    format: "";
    indent: 0;
    type: "root";
    version: 1;
  };
};

type ContentRow = {
  id: string;
  content: string | null;
};

const DEFAULT_PRODUCTION_DB_PATH = "/var/lib/pocketbook/pocketbook.db";

const TEXT_FORMAT_BOLD = 1;
const TEXT_FORMAT_ITALIC = 1 << 1;
const TEXT_FORMAT_STRIKETHROUGH = 1 << 2;
const TEXT_FORMAT_UNDERLINE = 1 << 3;
const TEXT_FORMAT_CODE = 1 << 4;
const TEXT_FORMAT_SUBSCRIPT = 1 << 5;
const TEXT_FORMAT_SUPERSCRIPT = 1 << 6;

const args = process.argv.slice(2);
const shouldApply = args.includes("--apply");

const dbPathArg = args.find((arg) => arg.startsWith("--db-path="));
const dbPath = dbPathArg
  ? dbPathArg.replace("--db-path=", "")
  : DEFAULT_PRODUCTION_DB_PATH;

const noteIdArg = args.find((arg) => arg.startsWith("--note-id="));
const noteIdFilter = noteIdArg ? noteIdArg.replace("--note-id=", "") : null;
const updateIdArg = args.find((arg) => arg.startsWith("--update-id="));
const updateIdFilter = updateIdArg ? updateIdArg.replace("--update-id=", "") : null;

function toTextFormat(attributes?: QuillOpAttributes): number {
  if (!attributes) {
    return 0;
  }

  let format = 0;

  if (attributes.bold) format |= TEXT_FORMAT_BOLD;
  if (attributes.italic) format |= TEXT_FORMAT_ITALIC;
  if (attributes.strike) format |= TEXT_FORMAT_STRIKETHROUGH;
  if (attributes.underline) format |= TEXT_FORMAT_UNDERLINE;
  if (attributes.code) format |= TEXT_FORMAT_CODE;
  if (attributes.script === "sub") format |= TEXT_FORMAT_SUBSCRIPT;
  if (attributes.script === "super") format |= TEXT_FORMAT_SUPERSCRIPT;

  return format;
}

function createTextNode(
  text: string,
  attributes?: QuillOpAttributes,
): LexicalTextNode {
  return {
    detail: 0,
    format: toTextFormat(attributes),
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function createParagraphNode(children: LexicalTextNode[]): LexicalParagraphNode {
  return {
    children: children.length > 0 ? children : [createTextNode("")],
    direction: null,
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: "",
    type: "paragraph",
    version: 1,
  };
}

function isLexicalEditorState(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const maybeRoot = (value as { root?: { type?: unknown } }).root;
  return maybeRoot?.type === "root";
}

function toEmbedText(embed: Record<string, unknown>): string {
  const image = embed.image;
  if (typeof image === "string") {
    return image;
  }

  return JSON.stringify(embed);
}

function convertQuillDeltaToLexical(delta: QuillDelta): LexicalEditorState {
  type Segment = {
    text: string;
    attributes?: QuillOpAttributes;
  };
  type Line = {
    segments: Segment[];
    lineAttributes?: QuillOpAttributes;
  };

  const lines: Line[] = [];
  let currentLine: Segment[] = [];

  for (const op of delta.ops) {
    if (typeof op.insert === "string") {
      const parts = op.insert.split("\n");

      for (let i = 0; i < parts.length; i += 1) {
        const part = parts[i];

        if (part.length > 0) {
          currentLine.push({ text: part, attributes: op.attributes });
        }

        if (i < parts.length - 1) {
          lines.push({
            segments: currentLine,
            lineAttributes: op.attributes,
          });
          currentLine = [];
        }
      }
      continue;
    }

    currentLine.push({
      text: toEmbedText(op.insert),
      attributes: op.attributes,
    });
  }

  if (currentLine.length > 0 || lines.length === 0) {
    lines.push({ segments: currentLine });
  }

  let orderedListCounter = 0;
  const lexicalParagraphs: LexicalParagraphNode[] = [];

  for (const line of lines) {
    const listType = line.lineAttributes?.list;

    let prefix = "";
    if (listType === "ordered") {
      orderedListCounter += 1;
      prefix = `${orderedListCounter}. `;
    } else {
      orderedListCounter = 0;
      if (listType === "bullet") {
        prefix = "• ";
      }
    }

    if (line.lineAttributes?.blockquote) {
      prefix = `> ${prefix}`;
    }
    if (line.lineAttributes?.["code-block"]) {
      prefix = `\`${prefix}`;
    }

    const children: LexicalTextNode[] = [];
    if (prefix.length > 0) {
      children.push(createTextNode(prefix));
    }

    for (const segment of line.segments) {
      children.push(createTextNode(segment.text, segment.attributes));
    }

    lexicalParagraphs.push(createParagraphNode(children));
  }

  return {
    root: {
      children: lexicalParagraphs,
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

function parseQuillDelta(content: string): QuillDelta | null {
  try {
    const parsed: unknown = JSON.parse(content);

    if (isLexicalEditorState(parsed)) {
      return null;
    }

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray((parsed as { ops?: unknown }).ops)
    ) {
      return parsed as QuillDelta;
    }
  } catch {
    // Ignored on purpose, reported by caller.
  }

  return null;
}

type ConversionResult = {
  convertedRows: Array<{ id: string; content: string }>;
  skippedAlreadyLexical: string[];
  skippedInvalid: string[];
};

function convertRows(rows: ContentRow[]): ConversionResult {
  const convertedRows: Array<{ id: string; content: string }> = [];
  const skippedAlreadyLexical: string[] = [];
  const skippedInvalid: string[] = [];

  for (const row of rows) {
    if (!row.content) {
      continue;
    }

    try {
      const parsed = JSON.parse(row.content) as unknown;
      if (isLexicalEditorState(parsed)) {
        skippedAlreadyLexical.push(row.id);
        continue;
      }
    } catch {
      // Continue and let parseQuillDelta classify as invalid.
    }

    const delta = parseQuillDelta(row.content);
    if (!delta) {
      skippedInvalid.push(row.id);
      continue;
    }

    const lexical = convertQuillDeltaToLexical(delta);
    convertedRows.push({
      id: row.id,
      content: JSON.stringify(lexical),
    });
  }

  return { convertedRows, skippedAlreadyLexical, skippedInvalid };
}

function main(): void {
  const db = new Database(dbPath, { readonly: !shouldApply });
  const noteRows: ContentRow[] = noteIdFilter
    ? db
        .prepare("SELECT id, content FROM notes WHERE id = ?")
        .all(noteIdFilter) as ContentRow[]
    : (db.prepare("SELECT id, content FROM notes").all() as ContentRow[]);

  const updateRows: ContentRow[] = updateIdFilter
    ? db
        .prepare("SELECT id, content FROM updates WHERE id = ?")
        .all(updateIdFilter) as ContentRow[]
    : (db.prepare("SELECT id, content FROM updates").all() as ContentRow[]);

  const noteResult = convertRows(noteRows);
  const updateResult = convertRows(updateRows);

  if (shouldApply && noteResult.convertedRows.length > 0) {
    const updateNotesStatement = db.prepare(
      "UPDATE notes SET content = ?, updated = CURRENT_TIMESTAMP WHERE id = ?",
    );
    const notesTx = db.transaction((updates: Array<{ id: string; content: string }>) => {
      for (const update of updates) {
        updateNotesStatement.run(update.content, update.id);
      }
    });

    notesTx(noteResult.convertedRows);
  }

  if (shouldApply && updateResult.convertedRows.length > 0) {
    const updateUpdatesStatement = db.prepare(
      "UPDATE updates SET content = ?, updated = CURRENT_TIMESTAMP WHERE id = ?",
    );
    const updatesTx = db.transaction((updates: Array<{ id: string; content: string }>) => {
      for (const update of updates) {
        updateUpdatesStatement.run(update.content, update.id);
      }
    });

    updatesTx(updateResult.convertedRows);
  }

  db.close();

  console.log(`Database: ${dbPath}`);
  console.log(`Mode: ${shouldApply ? "APPLY" : "DRY_RUN"}`);
  console.log(`Notes scanned: ${noteRows.length}`);
  console.log(`Notes converted: ${noteResult.convertedRows.length}`);
  console.log(`Notes already lexical: ${noteResult.skippedAlreadyLexical.length}`);
  console.log(
    `Notes skipped (invalid JSON or non-delta): ${noteResult.skippedInvalid.length}`,
  );
  console.log(`Updates scanned: ${updateRows.length}`);
  console.log(`Updates converted: ${updateResult.convertedRows.length}`);
  console.log(
    `Updates already lexical: ${updateResult.skippedAlreadyLexical.length}`,
  );
  console.log(
    `Updates skipped (invalid JSON or non-delta): ${updateResult.skippedInvalid.length}`,
  );

  if (!shouldApply) {
    console.log("\nRun again with --apply to persist converted content.");
  }
  if (noteResult.skippedInvalid.length > 0) {
    console.log(`\nSkipped note ids: ${noteResult.skippedInvalid.join(", ")}`);
  }
  if (updateResult.skippedInvalid.length > 0) {
    console.log(`Skipped update ids: ${updateResult.skippedInvalid.join(", ")}`);
  }
}

main();
