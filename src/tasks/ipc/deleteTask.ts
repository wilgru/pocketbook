import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";

export type DeleteTaskInput = { taskId: string };

createIpcHandler("deleteTask", ({ taskId }: DeleteTaskInput): string => {
  db.delete(tasks).where(eq(tasks.id, taskId)).run();

  return taskId;
});
