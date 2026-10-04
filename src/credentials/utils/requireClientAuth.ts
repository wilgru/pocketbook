import { redirect } from "@tanstack/react-router";
import { getSessionServerFn } from "src/credentials/serverFunctions/getSession";
import type { ParsedLocation } from "@tanstack/react-router";

export default async function requireClientAuth(location?: ParsedLocation) {
  const { isAuthenticated } = await getSessionServerFn();

  if (!isAuthenticated) {
    throw redirect({
      to: "/login",
      search: {
        redirect: location?.href ?? "/notes",
      },
    });
  }
}
