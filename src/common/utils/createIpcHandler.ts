/**
 * Registry of backend handlers exposed to the webview.
 *
 * Handler modules call `createIpcHandler` for its side effect of registering
 * themselves here. The desktop entrypoint then imports those modules and binds
 * every entry onto its window (see `desktop/registerBindings.ts`).
 *
 * This module is deliberately free of both Electron and Deno APIs so it can be
 * type-checked by the renderer's `tsc` pass as well as by Deno.
 */

export type RegisteredHandler = (input: never) => unknown;

const handlers = new Map<string, RegisteredHandler>();

export const createIpcHandler = <Input, Output>(
  name: string,
  handler: (input: Input) => Output,
): void => {
  if (handlers.has(name)) {
    throw new Error(`A handler named "${name}" is already registered.`);
  }

  handlers.set(name, handler as RegisteredHandler);
};

export const getRegisteredHandlers = (): ReadonlyMap<
  string,
  RegisteredHandler
> => handlers;
