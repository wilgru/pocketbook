import { jsonToolResult } from "src/mcp/utils/jsonToolResult";
import { getTagGroupsServerFn } from "src/tags/serverFunctions/getTagGroups";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

export function registerTagTools(server: McpServer) {
  server.registerTool(
    "list_tag_groups",
    {
      title: "List tag groups",
      description:
        "List a pocketbook's tag groups (with their tags) and any ungrouped tags.",
      inputSchema: z.object({ pocketbookId: z.string() }),
    },
    async ({ pocketbookId }) => {
      const result = await getTagGroupsServerFn({ data: { pocketbookId } });
      return jsonToolResult(result);
    },
  );
}
