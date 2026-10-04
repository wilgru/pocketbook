import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { dayjsColumn } from "src/db/dayjsColumn";
import type { InferSelectModel } from "drizzle-orm/table";

// - owner_email: the single permanent row holding the one address allowed to log in
// - login_code: hashed emailed code, short-lived
// - session: hashed browser cookie token
// - api_key: hashed key (reserved for later API/MCP access)
export const CREDENTIAL_TYPES = [
  "owner_email",
  "login_code",
  "session",
  "api_key",
] as const;
export type CredentialType = (typeof CREDENTIAL_TYPES)[number];

// Columns that only apply to some types are nullable.
export const credentials = sqliteTable(
  "credentials",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: CREDENTIAL_TYPES }).notNull(),
    email: text("email"),
    secretHash: text("secret_hash"),
    label: text("label"),
    prefix: text("prefix"),
    scopes: text("scopes"),
    attempts: integer("attempts"),
    created: dayjsColumn("created").notNull(),
    expires: dayjsColumn("expires"),
    lastUsed: dayjsColumn("last_used"),
    revoked: dayjsColumn("revoked"),
  },
  (table) => [
    index("credentials_type_secret_hash_idx").on(table.type, table.secretHash),
  ],
);

export type Credential = InferSelectModel<typeof credentials>;
