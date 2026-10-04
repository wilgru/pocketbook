// Usage: npm run deploy -- --owner-email you@example.com
// - First deploy (no owner stored yet): --owner-email is required.
// - Later deploys: omit it to keep the current owner, or pass it to replace it.
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import {
  fail,
  getStoredOwnerEmail,
  parseOwnerEmail,
  setOwnerEmail,
} from "./ownerEmail.mjs";

const config = "dist/server/wrangler.json";
const run = (command, args) =>
  execFileSync(command, args, { stdio: "inherit" });

const { values } = parseArgs({
  options: { "owner-email": { type: "string" } },
});

let requestedEmail = null;
if (values["owner-email"] !== undefined) {
  requestedEmail = parseOwnerEmail(values["owner-email"]);
  if (!requestedEmail) {
    fail("--owner-email must be a valid email address.");
  }
}

run("npm", ["run", "build"]);
run("npx", [
  "wrangler",
  "d1",
  "migrations",
  "apply",
  "DB",
  "--remote",
  "--config",
  config,
]);

const options = { remote: true, config };
const storedEmail = getStoredOwnerEmail(options);

if (!storedEmail && !requestedEmail) {
  fail(
    "No owner email is set yet. First deploy requires: npm run deploy -- --owner-email you@example.com",
  );
}

if (requestedEmail && requestedEmail !== storedEmail) {
  setOwnerEmail(requestedEmail, options);
  console.log(
    storedEmail
      ? `Owner email changed from ${storedEmail} to ${requestedEmail}`
      : `Owner email set to ${requestedEmail}`,
  );
} else {
  console.log(`Owner email: ${requestedEmail ?? storedEmail}`);
}

run("npx", ["wrangler", "deploy", "--config", config]);
