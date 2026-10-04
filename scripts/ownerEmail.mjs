import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import process from "node:process";

export function parseOwnerEmail(value) {
  const email = value?.trim().toLowerCase();
  if (!email || !/^[^\s'"@]+@[^\s'"@]+$/.test(email)) {
    return null;
  }
  return email;
}

function d1Execute(sql, { remote, config }) {
  const args = [
    "wrangler",
    "d1",
    "execute",
    "DB",
    remote ? "--remote" : "--local",
  ];
  if (config) {
    args.push("--config", config);
  }
  return execFileSync("npx", [...args, "--json", "--command", sql], {
    encoding: "utf8",
    stderr: "inherit",
  });
}

/** Returns the stored owner email, or null if none has been set. */
export function getStoredOwnerEmail(options) {
  const output = d1Execute(
    "SELECT email FROM credentials WHERE type = 'owner_email' LIMIT 1;",
    options,
  );
  const [result] = JSON.parse(output.slice(output.indexOf("[")));
  return result?.results?.[0]?.email ?? null;
}

/** Sets the single owner email, replacing any existing one and revoking active sessions and login codes. */
export function setOwnerEmail(email, options) {
  const now = new Date().toISOString();
  d1Execute(
    `UPDATE credentials SET revoked = '${now}' WHERE type IN ('session', 'login_code') AND revoked IS NULL; DELETE FROM credentials WHERE type = 'owner_email'; INSERT INTO credentials (id, type, email, created) VALUES ('${randomUUID()}', 'owner_email', '${email}', '${now}');`,
    options,
  );
}

export function fail(message) {
  console.error(message);
  process.exit(1);
}
