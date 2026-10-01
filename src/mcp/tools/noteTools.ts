import { jsonToolResult } from "src/mcp/utils/jsonToolResult";
import { linkSchema } from "src/mcp/utils/linkSchema";
import { createNoteServerFn } from "src/notes/serverFunctions/createNote";
import { deleteNoteServerFn } from "src/notes/serverFunctions/deleteNote";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { updateNoteServerFn } from "src/notes/serverFunctions/updateNote";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

export function registerNoteTools(server: McpServer) {
  server.registerTool(
    "list_notes",
    {
      title: "List notes",
      description:
        "List notes in a pocketbook, optionally filtered by bookmarked status or tag.",
      inputSchema: z.object({
        pocketbookId: z.string(),
        isBookmarked: z.boolean().optional(),
        tagIds: z.array(z.string()).optional(),
      }),
    },
    async (input) => {
      const result = await getNotesServerFn({ data: input });
      return jsonToolResult(result);
    },
  );

  server.registerTool(
    "get_note",
    {
      title: "Get note",
      description: "Get a single note by id, including its tasks and tags.",
      inputSchema: z.object({ noteId: z.string() }),
    },
    async ({ noteId }) => {
      const note = await getNoteServerFn({ data: { noteId } });
      return jsonToolResult(note);
    },
  );

  server.registerTool(
    "create_note",
    {
      title: "Create note",
      description: "Create a new note in a pocketbook.",
      inputSchema: z.object({
        pocketbookId: z.string(),
        title: z.string().nullable(),
        content: z
          .string()
          .nullable()
          .describe(
            "Serialised Lexical editor state JSON for the note body (the same format the app's rich-text editor persists). Pass null for an empty note.",
          ),
        isBookmarked: z.boolean(),
        tagIds: z.array(z.string()),
        links: z.array(linkSchema),
      }),
    },
    async (input) => {
      const note = await createNoteServerFn({ data: input });
      return jsonToolResult(note);
    },
  );

  server.registerTool(
    "update_note",
    {
      title: "Update note",
      description:
        "Update a note's title, content, bookmarked status, tags, and links. Tags and links are replaced entirely.",
      inputSchema: z.object({
        noteId: z.string(),
        title: z.string().nullable(),
        content: z
          .string()
          .nullable()
          .describe(
            "Serialised Lexical editor state JSON for the note body. Pass null to clear it.",
          ),
        isBookmarked: z.boolean(),
        tagIds: z.array(z.string()),
        links: z.array(linkSchema),
      }),
    },
    async (input) => {
      const note = await updateNoteServerFn({ data: input });
      return jsonToolResult(note);
    },
  );

  server.registerTool(
    "delete_note",
    {
      title: "Delete note",
      description: "Delete a note by id.",
      inputSchema: z.object({ noteId: z.string() }),
    },
    async ({ noteId }) => {
      const deletedId = await deleteNoteServerFn({ data: { noteId } });
      return jsonToolResult({ deletedId });
    },
  );
}
