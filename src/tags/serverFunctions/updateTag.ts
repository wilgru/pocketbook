import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { ColourName } from "src/colours/Colour.type";

export type UpdateTagInput = {
  tagId: string;
  name: string;
  colour: ColourName;
  icon: string;
  description: string | null;
  tagGroupId: string | null;
  layout: string;
  sortBy: string;
  sortDirection: string;
  groupBy: string | null;
  groupByTagGroupId: string | null;
  links: string;
};

export const updateTagServerFn = createServerFn({ method: "POST" })
  .validator((input: UpdateTagInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(tags)
      .set({
        name: data.name,
        colour: data.colour,
        icon: data.icon,
        description: data.description,
        tagGroup: data.tagGroupId,
        layout: data.layout,
        sortBy: data.sortBy,
        sortDirection: data.sortDirection,
        groupBy: data.groupBy,
        groupByTagGroupId: data.groupByTagGroupId,
        links: data.links,
        updated: now,
      })
      .where(eq(tags.id, data.tagId))
      .returning()
      .all();

    return updated;
  });
