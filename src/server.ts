import defaultServerEntry, {
  createServerEntry,
} from "@tanstack/react-start/server-entry";
import { handlePocketbookMcpRequest } from "src/mcp/server";

const MCP_PATH = "/api/mcp";

/**
 * Custom Worker entry. Wraps the default TanStack Start request handler so
 * requests to {@link MCP_PATH} are served by the MCP server instead of the
 * router/SSR pipeline. Everything else falls through to the default entry
 * unchanged. Referenced as `main` in `wrangler.jsonc` (see
 * `wrangler.example.jsonc`) in place of `@tanstack/react-start/server-entry`.
 */
export default createServerEntry({
  async fetch(request, opts) {
    const url = new URL(request.url);

    if (url.pathname === MCP_PATH) {
      return handlePocketbookMcpRequest(request);
    }

    return defaultServerEntry.fetch(request, opts);
  },
});
