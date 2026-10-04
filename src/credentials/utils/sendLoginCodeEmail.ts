// TODO: Cloudflare Email Service sending is paid (Workers Paid plan). If Cloudflare ever
// supports free email sending, replace this with a real send: add a `send_email` binding
// (`{ "name": "EMAIL" }`) and a sender var (commented out in wrangler.jsonc), then call
// `env.EMAIL.send({ to, from, subject, text })`.
// Until then the code is written to the logs: use `npx wrangler tail` or the Worker's
// Logs tab in the dashboard to read it.
export async function sendLoginCodeEmail(to: string, code: string) {
  console.log(`[login] code for ${to}: ${code}`);
}
