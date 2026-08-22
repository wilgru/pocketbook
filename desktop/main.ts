import { serveDir } from "@std/http/file-server";
import { registerBindings } from "./registerBindings.ts";

/**
 * Desktop entrypoint.
 *
 * `deno desktop` starts this script, opens a window, and points it at the
 * local HTTP server bound by `Deno.serve()`. The renderer is the same Vite SPA
 * the Electron build used; the backend handlers it calls are exposed as
 * bindings rather than over IPC.
 */

/**
 * A compiled desktop binary runs from its own executable, whereas `deno run`
 * and `deno desktop --hmr` run from the `deno` binary itself.
 */
function detectPackaged(): boolean {
  const executable = Deno.execPath().split("/").pop() ?? "";
  return executable !== "deno" && !executable.startsWith("deno.");
}

const isPackaged = detectPackaged();

// Must be set before the handler barrel is imported: importing a handler pulls
// in the database connection, which resolves its paths on first evaluation.
if (isPackaged) {
  Deno.env.set("POCKETBOOK_PACKAGED", "1");
}

if (!Deno.env.get("POCKETBOOK_MIGRATIONS_DIR")) {
  Deno.env.set(
    "POCKETBOOK_MIGRATIONS_DIR",
    new URL("../drizzle", import.meta.url).pathname,
  );
}

await import("./handlers.ts");

const distRoot = new URL("../dist", import.meta.url).pathname;
const indexHtml = `${distRoot}/index.html`;

Deno.serve(async (request) => {
  const response = await serveDir(request, {
    fsRoot: distRoot,
    quiet: true,
  });

  // The renderer is a client-side routed SPA, so unknown paths fall back to the
  // app shell instead of 404ing on a hard refresh or deep link.
  if (response.status === 404) {
    return new Response(await Deno.readTextFile(indexHtml), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return response;
});

const window = new Deno.BrowserWindow({
  title: "Pocketbook",
  width: isPackaged ? 1200 : 1800,
  height: 800,
  // Mirrors the Electron build's hidden title bar, which lets the app draw its
  // own header while keeping the native window controls.
  transparentTitlebar: true,
});

const registered = registerBindings(window);

/** Opens a URL in the user's default browser, replacing `shell.openExternal`. */
window.bind("openExternal", async (url: unknown) => {
  if (typeof url !== "string") {
    return { success: false, error: "Expected a URL string" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { success: false, error: "Invalid URL" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { success: false, error: "Only http(s) URLs can be opened" };
  }

  const command =
    Deno.build.os === "windows"
      ? new Deno.Command("cmd", { args: ["/c", "start", "", parsed.href] })
      : Deno.build.os === "darwin"
        ? new Deno.Command("open", { args: [parsed.href] })
        : new Deno.Command("xdg-open", { args: [parsed.href] });

  await command.output();

  return { success: true, data: parsed.href };
});

if (!isPackaged) {
  console.info(
    `Pocketbook: ${registered.length} bindings registered, serving ${distRoot}`,
  );
}
