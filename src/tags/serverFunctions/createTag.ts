import { createServerFn } from "@tanstack/react-start";
import { getDb } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { ColourName } from "src/colours/Colour.type";

export type CreateTagInput = {
  name: string;
  colour: ColourName;
  icon: string;
  description: string | null;
  tagGroupId: string | null;
  pocketbookId: string | null;
  userId: string | null;
};

export const createTagServerFn = createServerFn({ method: "POST" })
  .validator((input: CreateTagInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(tags)
      .values({
        id,
        name: data.name,
        colour: data.colour,
        icon: data.icon,
        description: data.description,
        tagGroup: data.tagGroupId,
        pocketbook: data.pocketbookId,
        user: data.userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return inserted;
  });
