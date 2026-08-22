import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { ColourName } from "src/colours/Colour.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";
import type { TagSchema } from "src/tags/tags.schema";

export type CreateTagInput = {
  name: string;
  colour: ColourName;
  icon: CustomisationIconName | null;
  description: string | null;
  tagGroupId: string | null;
  pocketbookId: string | null;
  userId: string | null;
};

createIpcHandler(
  "createTag",
  ({
    name,
    colour,
    icon,
    description,
    tagGroupId,
    pocketbookId,
    userId,
  }: CreateTagInput): TagSchema => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = db
      .insert(tags)
      .values({
        id,
        name,
        colour,
        icon,
        description,
        tagGroup: tagGroupId,
        pocketbook: pocketbookId,
        user: userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return inserted;
  },
);
