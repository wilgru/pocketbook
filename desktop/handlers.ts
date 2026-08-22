/**
 * Side-effect imports for every backend handler module.
 *
 * Importing a handler module registers it in the shared handler registry (see
 * `src/common/utils/createIpcHandler.ts`). The desktop entrypoint imports this
 * barrel dynamically, after configuring the environment, so that database
 * initialisation does not run before its paths are set.
 */

import "src/notes/ipc/createNote";
import "src/notes/ipc/deleteNote";
import "src/notes/ipc/getNote";
import "src/notes/ipc/getNotes";
import "src/notes/ipc/updateNote";
import "src/pocketbooks/ipc/createPocketbook";
import "src/pocketbooks/ipc/deletePocketbook";
import "src/pocketbooks/ipc/getPocketbook";
import "src/pocketbooks/ipc/getPocketbookContentCounts";
import "src/pocketbooks/ipc/getPocketbooks";
import "src/pocketbooks/ipc/updatePocketbook";
import "src/tasks/ipc/createTask";
import "src/tasks/ipc/deleteTask";
import "src/tasks/ipc/getTask";
import "src/tasks/ipc/getTasks";
import "src/tasks/ipc/updateTask";
import "src/tags/ipc/createTag";
import "src/tags/ipc/createTagGroup";
import "src/tags/ipc/deleteTag";
import "src/tags/ipc/deleteTagGroup";
import "src/tags/ipc/getTag";
import "src/tags/ipc/getTags";
import "src/tags/ipc/updateTag";
import "src/tags/ipc/updateTagGroup";
import "src/comments/ipc/createComment";
import "src/comments/ipc/deleteComment";
import "src/comments/ipc/getComment";
import "src/comments/ipc/getComments";
import "src/comments/ipc/getDatesWithComments";
import "src/comments/ipc/updateComment";
