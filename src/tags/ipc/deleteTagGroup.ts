import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";

export type DeleteTagGroupInput = { tagGroupId: string };

createIpcHandler(
  "deleteTagGroup",
  ({ tagGroupId }: DeleteTagGroupInput): string => {
    db.delete(tagGroups).where(eq(tagGroups.id, tagGroupId)).run();

    return tagGroupId;
  },
);
