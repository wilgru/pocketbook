import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";

export type DeleteTaskInput = { taskId: string };

export const deleteTaskServerFn = createServerFn({ method: "POST" })
  .validator((input: DeleteTaskInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    await db.delete(tasks).where(eq(tasks.id, data.taskId)).run();

    return data.taskId;
  });
