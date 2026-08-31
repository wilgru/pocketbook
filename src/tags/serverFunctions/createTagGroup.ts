import { createServerFn } from "@tanstack/react-start";
import { getDb } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";

export type CreateTagGroupInput = {
  title: string;
  pocketbookId: string | null;
  userId: string | null;
};

export const createTagGroupServerFn = createServerFn({ method: "POST" })
  .validator((input: CreateTagGroupInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(tagGroups)
      .values({
        id,
        title: data.title,
        pocketbook: data.pocketbookId,
        user: data.userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return inserted;
  });
