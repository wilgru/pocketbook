import { eq } from "drizzle-orm";
import { credentials } from "src/credentials/credentials.schema";
import { normaliseEmail } from "src/credentials/utils/crypto";
import { getDb } from "src/db/connection";

export async function getOwnerEmail(): Promise<string | null> {
  const row = await getDb()
    .select()
    .from(credentials)
    .where(eq(credentials.type, "owner_email"))
    .get();

  return row?.email ? normaliseEmail(row.email) : null;
}
