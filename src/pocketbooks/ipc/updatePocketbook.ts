import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { ColourName } from "src/colours/Colour.type";
import type { PocketbookSchema } from "src/pocketbooks/pocketbooks.schema";

export type UpdatePocketbookInput = {
  pocketbookId: string;
  title: string;
  icon: string;
  colour: ColourName;
  notesLayout: string;
  notesSortBy: string;
  notesSortDirection: string;
  notesGroupBy: string | null;
  bookmarkedLayout: string;
  bookmarkedSortBy: string;
  bookmarkedSortDirection: string;
  bookmarkedGroupBy: string | null;
};

createIpcHandler(
  "pocketbooks:update",
  ({
    pocketbookId,
    title,
    icon,
    colour,
    notesLayout,
    notesSortBy,
    notesSortDirection,
    notesGroupBy,
    bookmarkedLayout,
    bookmarkedSortBy,
    bookmarkedSortDirection,
    bookmarkedGroupBy,
  }: UpdatePocketbookInput): PocketbookSchema => {
    const now = new Date().toISOString();

    const [updated] = db
      .update(pocketbooks)
      .set({
        title,
        icon,
        colour,
        notesLayout,
        notesSortBy,
        notesSortDirection,
        notesGroupBy,
        bookmarkedLayout,
        bookmarkedSortBy,
        bookmarkedSortDirection,
        bookmarkedGroupBy,
        updated: now,
      })
      .where(eq(pocketbooks.id, pocketbookId))
      .returning()
      .all();

    return updated;
  },
);
