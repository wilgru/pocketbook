import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";
import type { TaskSchema } from "src/tasks/tasks.schema";

export type GetTaskInput = { taskId: string };

createIpcHandler("getTask", ({ taskId }: GetTaskInput): TaskSchema => {
  const row = db.select().from(tasks).where(eq(tasks.id, taskId)).get();

  if (!row) {
    throw new Error(`Task not found: ${taskId}`);
  }

  return row;
});
