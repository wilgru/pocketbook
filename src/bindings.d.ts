import type { CommentSchema } from "src/comments/comments.schema";
import type { CreateCommentInput } from "src/comments/ipc/createComment";
import type { DeleteCommentInput } from "src/comments/ipc/deleteComment";
import type {
  GetCommentInput,
  GetCommentResult,
} from "src/comments/ipc/getComment";
import type {
  GetCommentsInput,
  GetCommentsResult,
} from "src/comments/ipc/getComments";
import type {
  GetDatesWithCommentInput,
  GetDatesWithCommentResult,
} from "src/comments/ipc/getDatesWithComments";
import type { UpdateCommentInput } from "src/comments/ipc/updateComment";
import type { IpcApiMethod } from "src/common/types/IpcApiMethod.type";
import type { CreateNoteInput } from "src/notes/ipc/createNote";
import type { DeleteNoteInput } from "src/notes/ipc/deleteNote";
import type { GetNoteInput, GetNoteResult } from "src/notes/ipc/getNote";
import type { GetNotesInput, GetNotesResult } from "src/notes/ipc/getNotes";
import type { UpdateNoteInput } from "src/notes/ipc/updateNote";
import type { NoteSchema } from "src/notes/notes.schema";
import type { CreatePocketbookInput } from "src/pocketbooks/ipc/createPocketbook";
import type { DeletePocketbookInput } from "src/pocketbooks/ipc/deletePocketbook";
import type { GetPocketbookInput } from "src/pocketbooks/ipc/getPocketbook";
import type {
  GetPocketbookContentCountsInput,
  GetPocketbookContentCountsResult,
} from "src/pocketbooks/ipc/getPocketbookContentCounts";
import type {
  GetPocketbooksInput,
  GetPocketbooksResult,
} from "src/pocketbooks/ipc/getPocketbooks";
import type { UpdatePocketbookInput } from "src/pocketbooks/ipc/updatePocketbook";
import type { PocketbookSchema } from "src/pocketbooks/pocketbooks.schema";
import type { CreateTagInput } from "src/tags/ipc/createTag";
import type { CreateTagGroupInput } from "src/tags/ipc/createTagGroup";
import type { DeleteTagInput } from "src/tags/ipc/deleteTag";
import type { DeleteTagGroupInput } from "src/tags/ipc/deleteTagGroup";
import type { GetTagInput } from "src/tags/ipc/getTag";
import type { GetTagsInput, GetTagsResult } from "src/tags/ipc/getTags";
import type { UpdateTagInput } from "src/tags/ipc/updateTag";
import type { UpdateTagGroupInput } from "src/tags/ipc/updateTagGroup";
import type { TagSchema, TagGroupSchema } from "src/tags/tags.schema";
import type { CreateTaskInput } from "src/tasks/ipc/createTask";
import type { DeleteTaskInput } from "src/tasks/ipc/deleteTask";
import type { GetTaskInput } from "src/tasks/ipc/getTask";
import type { GetTasksInput, GetTasksResult } from "src/tasks/ipc/getTasks";
import type { UpdateTaskInput } from "src/tasks/ipc/updateTask";
import type { TaskSchema } from "src/tasks/tasks.schema";

/**
 * The backend surface exposed to the webview by `deno desktop`.
 *
 * Each entry is registered on the Deno side with `win.bind(name, handler)` and
 * is reachable from the webview as `bindings.<name>(input)`. The two sides are
 * separate realms, so this interface is the shared contract between them: the
 * desktop entrypoint checks its registrations against it, and the renderer gets
 * a typed `bindings` global from it.
 */
export interface PocketbookBindings {
  createNote: IpcApiMethod<CreateNoteInput, NoteSchema>;
  getNotes: IpcApiMethod<GetNotesInput, GetNotesResult>;
  getNote: IpcApiMethod<GetNoteInput, GetNoteResult>;
  updateNote: IpcApiMethod<UpdateNoteInput, NoteSchema>;
  deleteNote: IpcApiMethod<DeleteNoteInput, string>;

  createPocketbook: IpcApiMethod<CreatePocketbookInput, PocketbookSchema>;
  getPocketbooks: IpcApiMethod<GetPocketbooksInput, GetPocketbooksResult>;
  getPocketbook: IpcApiMethod<GetPocketbookInput, PocketbookSchema>;
  getPocketbookContentCounts: IpcApiMethod<
    GetPocketbookContentCountsInput,
    GetPocketbookContentCountsResult
  >;
  updatePocketbook: IpcApiMethod<UpdatePocketbookInput, PocketbookSchema>;
  deletePocketbook: IpcApiMethod<DeletePocketbookInput, string>;

  createTask: IpcApiMethod<CreateTaskInput, TaskSchema>;
  getTasks: IpcApiMethod<GetTasksInput, GetTasksResult>;
  getTask: IpcApiMethod<GetTaskInput, TaskSchema>;
  updateTask: IpcApiMethod<UpdateTaskInput, TaskSchema>;
  deleteTask: IpcApiMethod<DeleteTaskInput, string>;

  createTag: IpcApiMethod<CreateTagInput, TagSchema>;
  getTags: IpcApiMethod<GetTagsInput, GetTagsResult>;
  getTag: IpcApiMethod<GetTagInput, TagSchema>;
  updateTag: IpcApiMethod<UpdateTagInput, TagSchema>;
  deleteTag: IpcApiMethod<DeleteTagInput, string>;
  createTagGroup: IpcApiMethod<CreateTagGroupInput, TagGroupSchema>;
  updateTagGroup: IpcApiMethod<UpdateTagGroupInput, TagGroupSchema>;
  deleteTagGroup: IpcApiMethod<DeleteTagGroupInput, string>;

  createComment: IpcApiMethod<CreateCommentInput, CommentSchema>;
  getComments: IpcApiMethod<GetCommentsInput, GetCommentsResult>;
  getComment: IpcApiMethod<GetCommentInput, GetCommentResult>;
  getDatesWithComments: IpcApiMethod<
    GetDatesWithCommentInput,
    GetDatesWithCommentResult
  >;
  updateComment: IpcApiMethod<UpdateCommentInput, CommentSchema>;
  deleteComment: IpcApiMethod<DeleteCommentInput, string>;

  /** Opens an http(s) URL in the user's default browser. */
  openExternal: IpcApiMethod<string, string>;
}

declare global {
  /** Injected into the webview by `deno desktop`. */
  const bindings: PocketbookBindings;
}
