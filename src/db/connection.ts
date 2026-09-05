import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

// Call this inside a server function, never at module scope —
// the D1 binding is only available within a Worker request context.
export function getDb() {
  return drizzle(env.DB);
}
