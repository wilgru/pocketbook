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
import type { UpdateCommentInput } from "src/comments/ipc/updateComment";
import type { IpcApiMethod } from "src/common/types/IpcApiMethod.type";
import type { CreateNoteInput } from "src/notes/ipc/createNote";
import type { DeleteNoteInput } from "src/notes/ipc/deleteNote";
import type { GetNoteInput } from "src/notes/ipc/getNote";
import type { UpdateNoteInput } from "src/notes/ipc/updateNote";
import type { Note } from "src/notes/notes.schema";
import type { CreatePocketbookInput } from "src/pocketbooks/ipc/createPocketbook";
import type { DeletePocketbookInput } from "src/pocketbooks/ipc/deletePocketbook";
import type { GetPocketbookInput } from "src/pocketbooks/ipc/getPocketbook";
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

declare global {
  interface Window {
    api: {
      createNote: IpcApiMethod<CreateNoteInput, Note>;
      getNotes: IpcApiMethod<GetNotesInput, Note[]>;
      getNote: IpcApiMethod<GetNoteInput, Note>;
      updateNote: IpcApiMethod<UpdateNoteInput, Note>;
      deleteNote: IpcApiMethod<DeleteNoteInput, string>;

      createPocketbook: IpcApiMethod<CreatePocketbookInput, PocketbookSchema>;
      getPocketbooks: IpcApiMethod<GetPocketbooksInput, GetPocketbooksResult>;
      getPocketbook: IpcApiMethod<GetPocketbookInput, PocketbookSchema>;
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
      updateComment: IpcApiMethod<UpdateCommentInput, CommentSchema>;
      deleteComment: IpcApiMethod<DeleteCommentInput, string>;
    };
  }
}

export {};
