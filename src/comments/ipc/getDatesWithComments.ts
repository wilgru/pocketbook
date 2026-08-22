import { eq } from "drizzle-orm";
import { comments } from "src/comments/comments.schema";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";

export type GetDatesWithCommentInput = {
  pocketbookId: string;
};

export type DateWithCommentRow = {
  id: string;
  created: string;
  hasBookmarked: boolean;
};

export type GetDatesWithCommentResult = {
  dates: DateWithCommentRow[];
};

createIpcHandler(
  "getDatesWithComments",
  ({ pocketbookId }: GetDatesWithCommentInput): GetDatesWithCommentResult => {
    const rows = db
      .select({ created: comments.created })
      .from(comments)
      .where(eq(comments.pocketbook, pocketbookId))
      .all();

    const uniqueDates = new Map<string, string>();
    for (const row of rows) {
      const dateStr = row.created.split("T")[0];
      if (!uniqueDates.has(dateStr)) {
        uniqueDates.set(dateStr, row.created);
      }
    }

    return {
      dates: Array.from(uniqueDates.entries()).map(([dateStr, created]) => ({
        id: dateStr,
        created,
        hasBookmarked: false,
      })),
    };
  },
);
