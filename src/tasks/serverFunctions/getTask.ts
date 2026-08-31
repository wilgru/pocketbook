import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";

export type GetTaskInput = { taskId: string };

export const getTaskServerFn = createServerFn({ method: "GET" })
  .validator((input: GetTaskInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const row = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, data.taskId))
      .get();

    if (!row) {
      throw new Error(`Task not found: ${data.taskId}`);
    }

    return row;
  });
