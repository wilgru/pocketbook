// Sets the single email allowed to log in locally (replaces any existing one). Usage:
//   npm run db:seed-owner -- you@example.com
import process from "node:process";
import { fail, parseOwnerEmail, setOwnerEmail } from "./ownerEmail.mjs";

const email = parseOwnerEmail(process.argv[2]);
if (!email) {
  fail("Usage: npm run db:seed-owner -- <owner-email>");
}

setOwnerEmail(email, { remote: false });
console.log(`Local owner email set to ${email}`);
