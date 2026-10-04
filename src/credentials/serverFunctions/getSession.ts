import { createServerFn } from "@tanstack/react-start";
import { hasValidSession } from "src/credentials/utils/session";

export const getSessionServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
}).handler<Promise<{ isAuthenticated: boolean }>>(async () => ({
  isAuthenticated: await hasValidSession(),
}));
