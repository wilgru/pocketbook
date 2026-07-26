import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { normalizeLexicalContent } from "src/common/utils/lexicalContent";
import type { Comment, CommentTint } from "src/comments/Comment.type";
import type { CommentSchema } from "src/comments/comments.schema";
import type { Note } from "src/notes/Note.type";

dayjs.extend(utc);
export const mapComment = (
  comment: CommentSchema,
  options: { notes?: Note[] } = {},
): Comment => {
  return {
    id: comment.id,
    content: normalizeLexicalContent(comment.content),
    tint: (comment.tint as CommentTint | null) ?? null,
    isWaypoint: comment.isWaypoint,
    notes: options.notes ?? [],
    created: dayjs.utc(comment.created).local(),
    updated: dayjs.utc(comment.updated).local(),
  };
};
