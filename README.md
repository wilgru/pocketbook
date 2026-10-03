<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/96103b70-0a97-4337-8cbb-2b265f054a99">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/299fdeff-1ec5-4439-8106-1458c2f388c0">
    <img alt="Pocketbook logo" src="https://github.com/user-attachments/assets/299fdeff-1ec5-4439-8106-1458c2f388c0" width="300">
  </picture>
</p>

<p align="center">
  A free and open source notetaking app with modern features while still having a familiar experience
</p>

## Getting Started

1. Install recommended extensions (VS Code). The recommended extensions can be found under `.vscode/extensions.json` but VS Code should prompt you to install them as well.

2. Make sure you're using the workspace settings instead of your personal settings (which should be overridden by workspace settings by default).

3. Run the following command at the root of the repo's directory to create an `.env` file

   ```
   cp .env.example .env
   ```

4. Install Packages

   ```
   npm install
   ```

5. Start the Electron App

   ```
   npm run dev
   ```

## One-off note content migration (Quill Delta -> Lexical JSON)

For production note content migration, run:

```bash
npx tsx scripts/migrateNotesQuillToLexical.ts --db-path=/var/lib/pocketbook/pocketbook.db
```

Use `--apply` to persist changes:

```bash
npx tsx scripts/migrateNotesQuillToLexical.ts --db-path=/var/lib/pocketbook/pocketbook.db --apply
```

Optional: migrate a single note only:

```bash
npx tsx scripts/migrateNotesQuillToLexical.ts --db-path=/var/lib/pocketbook/pocketbook.db --note-id=<NOTE_ID> --apply
```

## Seed the development database

To wipe the development database and create testing pocketbooks:

```bash
npm run seed:dev
```

The script requires typing `WIPE DEV DB` at the warning prompt before making changes.

waiting on this bug to be fixed: https://github.com/TanStack/router/pull/7708

## MCP server

Pocketbook exposes its domain operations (pocketbooks, notes, tasks, comments, tags) as [Model Context Protocol](https://modelcontextprotocol.io) tools, so any MCP-aware client (Claude Desktop, a [TanStack AI](https://tanstack.com/ai) chat app using [`@tanstack/ai-mcp`](https://www.npmjs.com/package/@tanstack/ai-mcp), etc.) can read and manage pocketbook data.

- **Endpoint**: `POST /api/mcp` (Streamable HTTP transport), served from the Cloudflare Worker built in `src/server.ts` and implemented in `src/mcp/server.ts`.
- **Tools**: `list_pocketbooks`, `get_pocketbook`, `create_pocketbook`, `update_pocketbook`, `delete_pocketbook`, `list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`, `list_tasks`, `get_task`, `create_task`, `update_task`, `delete_task`, `list_comments`, `create_comment`, `update_comment`, `delete_comment`, `list_tag_groups`. Each tool wraps the equivalent existing server function (e.g. `getPocketbooksServerFn`) rather than duplicating its logic, so behaviour and validation stay in sync with the web app.
- **Auth**: the deployed app sits behind [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) (see the `access` block in `wrangler.example.jsonc`), which already gates every request to the Worker, including `/api/mcp`. There is no separate in-app auth to configure. Since MCP clients are non-interactive, connect to them using a Cloudflare Access [service token](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/) and send its credentials as the `CF-Access-Client-Id` / `CF-Access-Client-Secret` headers on every request.

### Connecting a client

Point any MCP HTTP client at `https://<your-worker-domain>/api/mcp` (or `http://localhost:5173/api/mcp` during local `npm run dev`). For example, with `@tanstack/ai-mcp`:

```ts
import { createMCPClient } from "@tanstack/ai-mcp";

const client = await createMCPClient({
  transport: {
    type: "http",
    url: "https://<your-worker-domain>/api/mcp",
    headers: {
      "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
      "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET,
    },
  },
});

const tools = await client.tools();
```

### Manual verification

```bash
npx wrangler dev
curl -X POST http://localhost:8787/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
