import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { ColourName } from "src/colours/Colour.type";

export type UpdatePocketbookInput = {
  pocketbookId: string;
  title: string;
  icon: string;
  colour: ColourName;
  notesLayout: string;
  notesSortBy: string;
  notesSortDirection: string;
  notesGroupBy: string | null;
  notesGroupByTagGroupId: string | null;
  bookmarkedLayout: string;
  bookmarkedSortBy: string;
  bookmarkedSortDirection: string;
  bookmarkedGroupBy: string | null;
  bookmarkedGroupByTagGroupId: string | null;
};

export const updatePocketbookServerFn = createServerFn({ method: "POST" })
  .validator((input: UpdatePocketbookInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(pocketbooks)
      .set({
        title: data.title,
        icon: data.icon,
        colour: data.colour,
        notesLayout: data.notesLayout,
        notesSortBy: data.notesSortBy,
        notesSortDirection: data.notesSortDirection,
        notesGroupBy: data.notesGroupBy,
        notesGroupByTagGroupId: data.notesGroupByTagGroupId,
        bookmarkedLayout: data.bookmarkedLayout,
        bookmarkedSortBy: data.bookmarkedSortBy,
        bookmarkedSortDirection: data.bookmarkedSortDirection,
        bookmarkedGroupBy: data.bookmarkedGroupBy,
        bookmarkedGroupByTagGroupId: data.bookmarkedGroupByTagGroupId,
        updated: now,
      })
      .where(eq(pocketbooks.id, data.pocketbookId))
      .returning()
      .all();

    return updated;
  });
