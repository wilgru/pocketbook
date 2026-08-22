import { getRegisteredHandlers } from "src/common/utils/createIpcHandler";

/**
 * Binds every registered backend handler onto a window.
 *
 * `bindings.<name>(input)` in the webview resolves to the matching handler's
 * return value, wrapped in the same `Result` envelope the renderer already
 * expects. Handlers may be sync or async; the return value is awaited either
 * way, because `win.bind` requires an async callback.
 *
 * Bindings are per-window, so this must be called for each window that needs
 * backend access.
 */
export function registerBindings(win: Deno.BrowserWindow): string[] {
  const registered: string[] = [];

  for (const [name, handler] of getRegisteredHandlers()) {
    win.bind(name, async (input: unknown) => {
      try {
        const data = await (handler as (value: unknown) => unknown)(input);
        return { success: true, data };
      } catch (error) {
        console.error(`Error in handler "${name}":`, error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        };
      }
    });

    registered.push(name);
  }

  return registered;
}
