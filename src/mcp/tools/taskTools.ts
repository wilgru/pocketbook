import dayjs from "dayjs";
import { jsonToolResult } from "src/mcp/utils/jsonToolResult";
import { linkSchema } from "src/mcp/utils/linkSchema";
import { createTaskServerFn } from "src/tasks/serverFunctions/createTask";
import { deleteTaskServerFn } from "src/tasks/serverFunctions/deleteTask";
import { getTaskServerFn } from "src/tasks/serverFunctions/getTask";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import { updateTaskServerFn } from "src/tasks/serverFunctions/updateTask";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

const isoDateSchema = z
  .string()
  .nullable()
  .describe("An ISO 8601 date-time string, or null.");

function toDayjs(isoDate: string | null) {
  return isoDate ? dayjs(isoDate) : null;
}

export function registerTaskTools(server: McpServer) {
  server.registerTool(
    "list_tasks",
    {
      title: "List tasks",
      description:
        "List tasks in a pocketbook, optionally filtered by note(s) or status.",
      inputSchema: z.object({
        pocketbookId: z.string(),
        noteIds: z.array(z.string()).optional(),
        status: z.enum(["incomplete", "completed", "cancelled"]).optional(),
        expandNotes: z
          .boolean()
          .optional()
          .describe("When true, include each task's full note."),
      }),
    },
    async (input) => {
      const result = await getTasksServerFn({ data: input });
      return jsonToolResult(result);
    },
  );

  server.registerTool(
    "get_task",
    {
      title: "Get task",
      description: "Get a single task by id.",
      inputSchema: z.object({ taskId: z.string() }),
    },
    async ({ taskId }) => {
      const task = await getTaskServerFn({ data: { taskId } });
      return jsonToolResult(task);
    },
  );

  server.registerTool(
    "create_task",
    {
      title: "Create task",
      description:
        "Create a new task in a pocketbook, optionally attached to a note.",
      inputSchema: z.object({
        pocketbookId: z.string(),
        title: z.string(),
        description: z.string(),
        link: z.string().describe("A single freeform link URL for the task."),
        links: z.array(linkSchema),
        isImportant: z.boolean(),
        noteId: z.string().nullable(),
        dueDate: isoDateSchema,
        insertAfterSortOrder: z
          .number()
          .nullable()
          .describe(
            "Sort order of the task to insert after, or null to append to the end.",
          ),
      }),
    },
    async ({ dueDate, ...rest }) => {
      const task = await createTaskServerFn({
        data: { ...rest, dueDate: toDayjs(dueDate) },
      });
      return jsonToolResult(task);
    },
  );

  server.registerTool(
    "update_task",
    {
      title: "Update task",
      description:
        "Update a task's fields, including completing, cancelling, or blocking it.",
      inputSchema: z.object({
        taskId: z.string(),
        title: z.string(),
        description: z.string(),
        link: z.string().nullable(),
        links: z.array(linkSchema),
        isImportant: z.boolean(),
        noteId: z.string().nullable(),
        dueDate: isoDateSchema,
        completedDate: isoDateSchema.describe(
          "Set to an ISO date-time to mark the task completed, or null to un-complete it.",
        ),
        cancelledDate: isoDateSchema.describe(
          "Set to an ISO date-time to mark the task cancelled, or null to un-cancel it.",
        ),
        blockedComment: z.string().nullable(),
        blockedDate: isoDateSchema,
        sortOrder: z.number().optional(),
      }),
    },
    async ({ dueDate, completedDate, cancelledDate, blockedDate, ...rest }) => {
      const task = await updateTaskServerFn({
        data: {
          ...rest,
          dueDate: toDayjs(dueDate),
          completedDate: toDayjs(completedDate),
          cancelledDate: toDayjs(cancelledDate),
          blockedDate: toDayjs(blockedDate),
        },
      });
      return jsonToolResult(task);
    },
  );

  server.registerTool(
    "delete_task",
    {
      title: "Delete task",
      description: "Delete a task by id.",
      inputSchema: z.object({ taskId: z.string() }),
    },
    async ({ taskId }) => {
      const deletedId = await deleteTaskServerFn({ data: { taskId } });
      return jsonToolResult({ deletedId });
    },
  );
}
