import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { registerCommentTools } from "src/mcp/tools/commentTools";
import { registerNoteTools } from "src/mcp/tools/noteTools";
import { registerPocketbookTools } from "src/mcp/tools/pocketbookTools";
import { registerTagTools } from "src/mcp/tools/tagTools";
import { registerTaskTools } from "src/mcp/tools/taskTools";

/**
 * Builds a fresh `McpServer` instance with every Pocketbook tool registered.
 * `createMcpHandler` calls this factory once per request, so the server
 * (and its registered tools) must be cheap to construct and hold no
 * per-connection state.
 */
function createPocketbookMcpServer() {
  const server = new McpServer({
    name: "pocketbook",
    version: "0.0.0",
  });

  registerPocketbookTools(server);
  registerNoteTools(server);
  registerTaskTools(server);
  registerCommentTools(server);
  registerTagTools(server);

  return server;
}

const mcpHandler = createMcpHandler(createPocketbookMcpServer, {
  onerror: (error) => {
    console.error("[mcp]", error);
  },
});

/**
 * Web-standard (`fetch`) MCP HTTP handler for the Pocketbook domain.
 * Mounted in `src/server.ts` at `/api/mcp`.
 *
 * Tool handlers call the app's existing `createServerFn`-based server
 * functions directly (see `src/mcp/tools/*.ts`), which requires an active
 * TanStack Start request context. Since this handler is invoked from a
 * custom Worker entry that bypasses the Start router/SSR pipeline, that
 * context is established manually here rather than by `createStartHandler`.
 */
export function handlePocketbookMcpRequest(request: Request) {
  return runWithStartContext(
    {
      request,
      startOptions: {},
      executedRequestMiddlewares: new Set(),
      handlerType: "serverFn",
      contextAfterGlobalMiddlewares: {},
      getRouter: () => {
        throw new Error(
          "The router is not available from the MCP request handler.",
        );
      },
    },
    () => mcpHandler.fetch(request),
  );
}
