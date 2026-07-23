import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { ColourName } from "src/colours/Colour.type";
import type { TagSchema } from "src/tags/tags.schema";

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
  links: string;
};

createIpcHandler(
  "tags:update",
  ({
    tagId,
    name,
    colour,
    icon,
    description,
    tagGroupId,
    layout,
    sortBy,
    sortDirection,
    groupBy,
    links,
  }: UpdateTagInput): TagSchema => {
    const now = new Date().toISOString();

    const [updated] = db
      .update(tags)
      .set({
        name,
        colour,
        icon,
        description,
        tagGroup: tagGroupId,
        layout,
        sortBy,
        sortDirection,
        groupBy,
        links,
        updated: now,
      })
      .where(eq(tags.id, tagId))
      .returning()
      .all();

    return updated;
  },
);
