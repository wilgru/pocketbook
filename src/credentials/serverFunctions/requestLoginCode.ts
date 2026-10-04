import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { credentials } from "src/credentials/credentials.schema";
import { getOwnerEmail } from "src/credentials/utils/ownerEmail";
import {
  generateLoginCode,
  normaliseEmail,
  sha256Hex,
} from "src/credentials/utils/crypto";
import { sendLoginCodeEmail } from "src/credentials/utils/sendLoginCodeEmail";
import { getDb } from "src/db/connection";

export type RequestLoginCodeInput = { email: string };

const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

// Always resolves the same way so the allowed address isn't revealed.
export const requestLoginCodeServerFn = createServerFn({
  method: "POST",
  strict: { output: false },
})
  .validator((input: RequestLoginCodeInput) => input)
  .handler<Promise<{ ok: true }>>(async ({ data }) => {
    const email = normaliseEmail(data.email);
    if (email !== (await getOwnerEmail())) {
      return { ok: true };
    }

    const db = getDb();
    const existing = await db
      .select()
      .from(credentials)
      .where(eq(credentials.type, "login_code"))
      .get();

    if (
      existing &&
      existing.created.isAfter(dayjs().subtract(RESEND_COOLDOWN_SECONDS, "s"))
    ) {
      return { ok: true };
    }

    const code = generateLoginCode();
    await db
      .delete(credentials)
      .where(eq(credentials.type, "login_code"))
      .run();
    await db
      .insert(credentials)
      .values({
        id: crypto.randomUUID(),
        type: "login_code",
        email,
        secretHash: await sha256Hex(code),
        attempts: 0,
        created: dayjs(),
        expires: dayjs().add(CODE_TTL_MINUTES, "m"),
      })
      .run();

    await sendLoginCodeEmail(email, code);

    return { ok: true };
  });
