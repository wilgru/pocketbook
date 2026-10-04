import { createMiddleware } from "@tanstack/react-start";
import { UNAUTHORIZED_MESSAGE } from "src/credentials/utils/unauthorized";
import { hasValidSession } from "src/credentials/utils/session";

// Attach to server functions that require a signed-in owner.
export const credentialsMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  if (!(await hasValidSession())) {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }
  return next();
});
