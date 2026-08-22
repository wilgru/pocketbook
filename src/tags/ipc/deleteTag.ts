import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { noteTags } from "src/notes/notes.schema";
import { tags } from "src/tags/tags.schema";

export type DeleteTagInput = { tagId: string };

createIpcHandler("deleteTag", ({ tagId }: DeleteTagInput): string => {
  db.delete(noteTags).where(eq(noteTags.tagId, tagId)).run();
  db.delete(tags).where(eq(tags.id, tagId)).run();

  return tagId;
});
