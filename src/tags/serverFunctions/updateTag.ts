import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";
import type { Tag } from "src/tags/tags.schema";

export type UpdateTagInput = {
  tagId: string;
  name: string;
  colour: Colour;
  icon: CustomisationIconName | null;
  description: string | null;
  tagGroupId: string | null;
  layout: "list" | "table"; // TODO extract this type to somewhere
  sortBy: "created" | "alphabetical";
  sortDirection: "desc" | "asc";
  groupBy: "tag" | "created" | "tagGroup" | null;
  groupByTagGroupId: string | null;
  links: Link[];
};

export const updateTagServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .validator((input: UpdateTagInput) => input)
  .handler<Promise<Tag>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();

    const [updated] = await db
      .update(tags)
      .set({
        name: data.name,
        colour: data.colour,
        icon: data.icon,
        description: data.description,
        tagGroupId: data.tagGroupId,
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

    return { ...updated, noteCount: 0 }; // TODO: add note count
  });
