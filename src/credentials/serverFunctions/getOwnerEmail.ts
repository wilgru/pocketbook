import { createServerFn } from "@tanstack/react-start";
import { credentialsMiddleware } from "src/credentials/credentialsMiddleware";
import { getOwnerEmail } from "src/credentials/utils/ownerEmail";

export const getOwnerEmailServerFn = createServerFn({
  method: "GET",
  strict: false,
})
  .middleware([credentialsMiddleware])
  .validator((input) => input)
  .handler<Promise<{ email: string | null }>>(async () => ({
    email: await getOwnerEmail(),
  }));
