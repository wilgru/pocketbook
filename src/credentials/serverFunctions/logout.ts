import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { credentials } from "src/credentials/credentials.schema";
import { sha256Hex } from "src/credentials/utils/crypto";
import { SESSION_COOKIE } from "src/credentials/utils/session";
import { getDb } from "src/db/connection";

export const logoutServerFn = createServerFn({
  method: "POST",
  strict: { output: false },
}).handler<Promise<{ ok: true }>>(async () => {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    await getDb()
      .delete(credentials)
      .where(
        and(
          eq(credentials.type, "session"),
          eq(credentials.secretHash, await sha256Hex(token)),
        ),
      )
      .run();
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true };
});
