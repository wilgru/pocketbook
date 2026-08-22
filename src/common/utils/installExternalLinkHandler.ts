/**
 * Routes external links out to the user's default browser.
 *
 * The Electron build did this in the main process with `will-navigate` and
 * `setWindowOpenHandler`. `deno desktop` exposes no navigation interception, so
 * the equivalent lives here: anchor clicks that would leave the app's own
 * origin are cancelled and handed to the `openExternal` binding instead.
 */
export function installExternalLinkHandler(): void {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const anchor = (event.target as Element | null)?.closest?.("a");
    const href = anchor?.getAttribute("href");

    if (!anchor || !href) {
      return;
    }

    let destination: URL;
    try {
      destination = new URL(href, globalThis.location.href);
    } catch {
      return;
    }

    if (destination.protocol !== "http:" && destination.protocol !== "https:") {
      return;
    }

    // Same-origin links belong to the client-side router.
    if (destination.origin === globalThis.location.origin) {
      return;
    }

    event.preventDefault();
    void bindings.openExternal(destination.href);
  });
}
