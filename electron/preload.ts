import { contextBridge, ipcRenderer } from "electron";
import type { CreateCommentInput } from "src/comments/ipc/createComment";
import type { DeleteCommentInput } from "src/comments/ipc/deleteComment";
import type { GetCommentInput } from "src/comments/ipc/getComment";
import type { GetCommentsInput } from "src/comments/ipc/getComments";
import type { UpdateCommentInput } from "src/comments/ipc/updateComment";
import type { CreateNoteInput } from "src/notes/ipc/createNote";
import type { DeleteNoteInput } from "src/notes/ipc/deleteNote";
import type { GetNoteInput } from "src/notes/ipc/getNote";
import type { GetNotesInput } from "src/notes/ipc/getNotes";
import type { UpdateNoteInput } from "src/notes/ipc/updateNote";
import type { CreatePocketbookInput } from "src/pocketbooks/ipc/createPocketbook";
import type { DeletePocketbookInput } from "src/pocketbooks/ipc/deletePocketbook";
import type { GetPocketbookInput } from "src/pocketbooks/ipc/getPocketbook";
import type { GetPocketbooksInput } from "src/pocketbooks/ipc/getPocketbooks";
import type { UpdatePocketbookInput } from "src/pocketbooks/ipc/updatePocketbook";
import type { CreateTagInput } from "src/tags/ipc/createTag";
import type { CreateTagGroupInput } from "src/tags/ipc/createTagGroup";
import type { DeleteTagInput } from "src/tags/ipc/deleteTag";
import type { DeleteTagGroupInput } from "src/tags/ipc/deleteTagGroup";
import type { GetTagInput } from "src/tags/ipc/getTag";
import type { GetTagsInput } from "src/tags/ipc/getTags";
import type { UpdateTagInput } from "src/tags/ipc/updateTag";
import type { UpdateTagGroupInput } from "src/tags/ipc/updateTagGroup";
import type { CreateTaskInput } from "src/tasks/ipc/createTask";
import type { DeleteTaskInput } from "src/tasks/ipc/deleteTask";
import type { GetTaskInput } from "src/tasks/ipc/getTask";
import type { GetTasksInput } from "src/tasks/ipc/getTasks";
import type { UpdateTaskInput } from "src/tasks/ipc/updateTask";

contextBridge.exposeInMainWorld("api", {
  createNote: (data: CreateNoteInput) =>
    ipcRenderer.invoke("notes:create", data),
  getNotes: (data: GetNotesInput) => ipcRenderer.invoke("notes:getAll", data),
  getNote: (data: GetNoteInput) => ipcRenderer.invoke("notes:getOne", data),
  updateNote: (data: UpdateNoteInput) =>
    ipcRenderer.invoke("notes:update", data),
  deleteNote: (data: DeleteNoteInput) =>
    ipcRenderer.invoke("notes:delete", data),

  createPocketbook: (data: CreatePocketbookInput) =>
    ipcRenderer.invoke("pocketbooks:create", data),
  getPocketbooks: (data: GetPocketbooksInput) =>
    ipcRenderer.invoke("pocketbooks:getAll", data),
  getPocketbook: (data: GetPocketbookInput) =>
    ipcRenderer.invoke("pocketbooks:getOne", data),
  updatePocketbook: (data: UpdatePocketbookInput) =>
    ipcRenderer.invoke("pocketbooks:update", data),
  deletePocketbook: (data: DeletePocketbookInput) =>
    ipcRenderer.invoke("pocketbooks:delete", data),

  createTask: (data: CreateTaskInput) =>
    ipcRenderer.invoke("tasks:create", data),
  getTasks: (data: GetTasksInput) => ipcRenderer.invoke("tasks:getAll", data),
  getTask: (data: GetTaskInput) => ipcRenderer.invoke("tasks:getOne", data),
  updateTask: (data: UpdateTaskInput) =>
    ipcRenderer.invoke("tasks:update", data),
  deleteTask: (data: DeleteTaskInput) =>
    ipcRenderer.invoke("tasks:delete", data),

  createTag: (data: CreateTagInput) => ipcRenderer.invoke("tags:create", data),
  getTags: (data: GetTagsInput) => ipcRenderer.invoke("tags:getAll", data),
  getTag: (data: GetTagInput) => ipcRenderer.invoke("tags:getOne", data),
  updateTag: (data: UpdateTagInput) => ipcRenderer.invoke("tags:update", data),
  deleteTag: (data: DeleteTagInput) => ipcRenderer.invoke("tags:delete", data),
  createTagGroup: (data: CreateTagGroupInput) =>
    ipcRenderer.invoke("tagGroups:create", data),
  updateTagGroup: (data: UpdateTagGroupInput) =>
    ipcRenderer.invoke("tagGroups:update", data),
  deleteTagGroup: (data: DeleteTagGroupInput) =>
    ipcRenderer.invoke("tagGroups:delete", data),

  createComment: (data: CreateCommentInput) =>
    ipcRenderer.invoke("comments:create", data),
  getComments: (data: GetCommentsInput) =>
    ipcRenderer.invoke("comments:getAll", data),
  getComment: (data: GetCommentInput) =>
    ipcRenderer.invoke("comments:getOne", data),
  updateComment: (data: UpdateCommentInput) =>
    ipcRenderer.invoke("comments:update", data),
  deleteComment: (data: DeleteCommentInput) =>
    ipcRenderer.invoke("comments:delete", data),
});
