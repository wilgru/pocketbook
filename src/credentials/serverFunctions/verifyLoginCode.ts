import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { credentials } from "src/credentials/credentials.schema";
import { getOwnerEmail } from "src/credentials/utils/ownerEmail";
import {
  generateToken,
  normaliseEmail,
  sha256Hex,
} from "src/credentials/utils/crypto";
import { SESSION_COOKIE, SESSION_DAYS } from "src/credentials/utils/session";
import { getDb } from "src/db/connection";

export type VerifyLoginCodeInput = { email: string; code: string };

const MAX_ATTEMPTS = 5;

export const verifyLoginCodeServerFn = createServerFn({
  method: "POST",
  strict: { output: false },
})
  .validator((input: VerifyLoginCodeInput) => input)
  .handler<Promise<{ ok: boolean }>>(async ({ data }) => {
    const email = normaliseEmail(data.email);
    if (email !== (await getOwnerEmail())) {
      return { ok: false };
    }

    const db = getDb();
    const loginCode = await db
      .select()
      .from(credentials)
      .where(eq(credentials.type, "login_code"))
      .get();

    if (
      !loginCode ||
      !loginCode.expires ||
      loginCode.expires.isBefore(dayjs())
    ) {
      return { ok: false };
    }

    const attempts = (loginCode.attempts ?? 0) + 1;
    if (attempts > MAX_ATTEMPTS) {
      await db
        .delete(credentials)
        .where(eq(credentials.id, loginCode.id))
        .run();
      return { ok: false };
    }
    await db
      .update(credentials)
      .set({ attempts })
      .where(eq(credentials.id, loginCode.id))
      .run();

    const submittedHash = await sha256Hex(data.code.trim());
    if (submittedHash !== loginCode.secretHash) {
      return { ok: false };
    }

    // Codes are single use.
    await db.delete(credentials).where(eq(credentials.id, loginCode.id)).run();

    const token = generateToken();
    await db
      .insert(credentials)
      .values({
        id: crypto.randomUUID(),
        type: "session",
        secretHash: await sha256Hex(token),
        created: dayjs(),
        expires: dayjs().add(SESSION_DAYS, "d"),
      })
      .run();

    setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    });

    return { ok: true };
  });
