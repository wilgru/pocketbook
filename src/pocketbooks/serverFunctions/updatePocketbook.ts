import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { eq, isNull, count, and } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import { tasks } from "src/tasks/tasks.schema";
import type { Colour } from "src/colours/Colour.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

export type UpdatePocketbookInput = {
  pocketbookId: string;
  title: string;
  icon: CustomisationIconName | null;
  colour: Colour;
  notesLayout: "list" | "table";
  notesSortBy: "alphabetical" | "created";
  notesSortDirection: "asc" | "desc";
  notesGroupBy: "created" | "tag" | "tagGroup" | null;
  notesGroupByTagGroupId: string | null;
  bookmarkedLayout: "list" | "table";
  bookmarkedSortBy: "alphabetical" | "created";
  bookmarkedSortDirection: "asc" | "desc";
  bookmarkedGroupBy: "created" | "tag" | "tagGroup" | null;
  bookmarkedGroupByTagGroupId: string | null;
};

export const updatePocketbookServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .validator((input: UpdatePocketbookInput) => input)
  .handler<Promise<Pocketbook>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();

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

    const noteCountRows = await db
      .select({ count: count() })
      .from(notes)
      .where(and(isNull(notes.deleted), eq(notes.pocketbookId, updated.id)))
      .all();

    const taskCountRows = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.pocketbookId, updated.id))
      .all();

    return {
      ...updated,
      taskCount: noteCountRows[0].count,
      noteCount: taskCountRows[0].count,
    };
  });
