import { ColourName } from "src/colours/Colour.type";
import { getColour } from "src/colours/utils/getColour";
import { jsonToolResult } from "src/mcp/utils/jsonToolResult";
import { createPocketbookServerFn } from "src/pocketbooks/serverFunctions/createPocketbook";
import { deletePocketbookServerFn } from "src/pocketbooks/serverFunctions/deletePocketbook";
import { getPocketbookServerFn } from "src/pocketbooks/serverFunctions/getPocketbook";
import { getPocketbooksServerFn } from "src/pocketbooks/serverFunctions/getPocketbooks";
import { updatePocketbookServerFn } from "src/pocketbooks/serverFunctions/updatePocketbook";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";

const colourNameSchema = z
  .nativeEnum(ColourName)
  .describe("One of the app's named accent colours.");

const iconSchema = z
  .string()
  .nullable()
  .describe(
    "The name of a Phosphor icon used elsewhere in this app (e.g. 'bookOpen'), or null for no icon.",
  );

const layoutSchema = z.enum(["list", "table"]);
const sortBySchema = z.enum(["alphabetical", "created"]);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const groupBySchema = z.enum(["created", "tag", "tagGroup"]).nullable();

export function registerPocketbookTools(server: McpServer) {
  server.registerTool(
    "list_pocketbooks",
    {
      title: "List pocketbooks",
      description:
        "List all pocketbooks in the app, including their note and task counts.",
    },
    async () => {
      const result = await getPocketbooksServerFn({ data: {} });
      return jsonToolResult(result);
    },
  );

  server.registerTool(
    "get_pocketbook",
    {
      title: "Get pocketbook",
      description: "Get a single pocketbook by id.",
      inputSchema: z.object({ pocketbookId: z.string() }),
    },
    async ({ pocketbookId }) => {
      const pocketbook = await getPocketbookServerFn({
        data: { pocketbookId },
      });
      return jsonToolResult(pocketbook);
    },
  );

  server.registerTool(
    "create_pocketbook",
    {
      title: "Create pocketbook",
      description: "Create a new pocketbook.",
      inputSchema: z.object({
        title: z.string(),
        icon: iconSchema,
        colour: colourNameSchema,
      }),
    },
    async ({ title, icon, colour }) => {
      const pocketbook = await createPocketbookServerFn({
        data: {
          title,
          icon: icon as CustomisationIconName | null,
          colour: getColour(colour),
        },
      });
      return jsonToolResult(pocketbook);
    },
  );

  server.registerTool(
    "update_pocketbook",
    {
      title: "Update pocketbook",
      description:
        "Update a pocketbook's title, icon, colour, and notes/bookmarked view preferences.",
      inputSchema: z.object({
        pocketbookId: z.string(),
        title: z.string(),
        icon: iconSchema,
        colour: colourNameSchema,
        notesLayout: layoutSchema,
        notesSortBy: sortBySchema,
        notesSortDirection: sortDirectionSchema,
        notesGroupBy: groupBySchema,
        notesGroupByTagGroupId: z.string().nullable(),
        bookmarkedLayout: layoutSchema,
        bookmarkedSortBy: sortBySchema,
        bookmarkedSortDirection: sortDirectionSchema,
        bookmarkedGroupBy: groupBySchema,
        bookmarkedGroupByTagGroupId: z.string().nullable(),
      }),
    },
    async ({ colour, icon, ...rest }) => {
      const pocketbook = await updatePocketbookServerFn({
        data: {
          ...rest,
          icon: icon as CustomisationIconName | null,
          colour: getColour(colour),
        },
      });
      return jsonToolResult(pocketbook);
    },
  );

  server.registerTool(
    "delete_pocketbook",
    {
      title: "Delete pocketbook",
      description: "Delete a pocketbook by id.",
      inputSchema: z.object({ pocketbookId: z.string() }),
    },
    async ({ pocketbookId }) => {
      const deletedId = await deletePocketbookServerFn({
        data: { pocketbookId },
      });
      return jsonToolResult({ deletedId });
    },
  );
}
