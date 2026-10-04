import { getCookie } from "@tanstack/react-start/server";
import dayjs from "dayjs";
import { and, eq, isNull } from "drizzle-orm";
import { credentials } from "src/credentials/credentials.schema";
import { sha256Hex } from "src/credentials/utils/crypto";
import { getDb } from "src/db/connection";

export const SESSION_COOKIE = "pb_session";
export const SESSION_DAYS = 30;

/** Whether the current request carries a valid session cookie. */
export async function hasValidSession(): Promise<boolean> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) {
    return false;
  }

  const session = await getDb()
    .select()
    .from(credentials)
    .where(
      and(
        eq(credentials.type, "session"),
        eq(credentials.secretHash, await sha256Hex(token)),
        isNull(credentials.revoked),
      ),
    )
    .get();

  return !!session?.expires && session.expires.isAfter(dayjs());
}
