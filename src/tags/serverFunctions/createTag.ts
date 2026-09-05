import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { getDb } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { Colour } from "src/colours/Colour.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";
import type { Tag } from "src/tags/tags.schema";

export type CreateTagInput = {
  name: string;
  colour: Colour;
  icon: CustomisationIconName | null;
  description: string | null;
  tagGroupId: string | null;
  pocketbookId: string;
};

export const createTagServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .validator((input: CreateTagInput) => input)
  .handler<Promise<Tag>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(tags)
      .values({
        id,
        name: data.name,
        colour: data.colour,
        icon: data.icon,
        description: data.description,
        tagGroupId: data.tagGroupId,
        pocketbookId: data.pocketbookId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return {
      ...inserted,
      noteCount: 0, // TODO add note count
    };
  });
