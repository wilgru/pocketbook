import { ColourName } from "src/colours/Colour.type";
import { getColour } from "src/colours/utils/getColour";
import { createCommentServerFn } from "src/comments/serverFunctions/createComment";
import { deleteCommentServerFn } from "src/comments/serverFunctions/deleteComment";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { updateCommentServerFn } from "src/comments/serverFunctions/updateComment";
import { jsonToolResult } from "src/mcp/utils/jsonToolResult";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

const colourNameSchema = z
  .nativeEnum(ColourName)
  .nullable()
  .describe("One of the app's named accent colours, or null for none.");

const contentSchema = z
  .string()
  .nullable()
  .describe(
    "Serialised Lexical editor state JSON for the comment body. Pass null for an empty comment.",
  );

export function registerCommentTools(server: McpServer) {
  server.registerTool(
    "list_comments",
    {
      title: "List comments",
      description:
        "List comments (updates) in a pocketbook, optionally filtered to a single note.",
      inputSchema: z.object({
        pocketbookId: z.string(),
        noteId: z.string().optional(),
      }),
    },
    async (input) => {
      const result = await getCommentsServerFn({ data: input });
      return jsonToolResult(result);
    },
  );

  server.registerTool(
    "create_comment",
    {
      title: "Create comment",
      description:
        "Create a new comment (update), optionally attached to one or more notes.",
      inputSchema: z.object({
        pocketbookId: z.string().nullable(),
        content: contentSchema,
        colour: colourNameSchema,
        isWaypoint: z.boolean(),
        noteIds: z.array(z.string()),
      }),
    },
    async ({ colour, ...rest }) => {
      const comment = await createCommentServerFn({
        data: { ...rest, colour: colour ? getColour(colour) : null },
      });
      return jsonToolResult(comment);
    },
  );

  server.registerTool(
    "update_comment",
    {
      title: "Update comment",
      description:
        "Update a comment's content, colour, waypoint flag, and attached notes. Attached notes are replaced entirely.",
      inputSchema: z.object({
        commentId: z.string(),
        content: contentSchema,
        colour: colourNameSchema,
        isWaypoint: z.boolean(),
        noteIds: z.array(z.string()),
      }),
    },
    async ({ colour, ...rest }) => {
      const comment = await updateCommentServerFn({
        data: { ...rest, colour: colour ? getColour(colour) : null },
      });
      return jsonToolResult(comment);
    },
  );

  server.registerTool(
    "delete_comment",
    {
      title: "Delete comment",
      description: "Delete a comment by id.",
      inputSchema: z.object({ commentId: z.string() }),
    },
    async ({ commentId }) => {
      const deletedId = await deleteCommentServerFn({ data: { commentId } });
      return jsonToolResult({ deletedId });
    },
  );
}
