/* Prints the /opportunities dashboard URL for the current CRON_SECRET.
   The token is derived, not stored — see lib/jobs/auth.ts. Rotating
   CRON_SECRET changes this URL.

   Usage:
     npm run job-radar:url
     npm run job-radar:url -- https://kathanpatel.vercel.app   (note the --) */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function readEnvLocal() {
  try {
    /* Split on /\r?\n/ rather than "\n": .env.local is CRLF on Windows, and a
       trailing \r survives a plain split. It then breaks any /^KEY=(.*)$/
       match, because `.` in a JS regex does not match \r and `$` without the
       m flag demands the true end of the string — so the capture silently
       fails and the secret reads as missing. */
    for (const raw of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (line.startsWith("CRON_SECRET=")) {
        return line.slice("CRON_SECRET=".length).trim();
      }
    }
  } catch {
    /* no .env.local — fall through to process.env */
  }
  return null;
}

const secret = process.env.CRON_SECRET || readEnvLocal();

if (!secret || secret.length < 16) {
  console.error("CRON_SECRET is missing or shorter than 16 characters.");
  console.error("Generate one with:");
  console.error(`  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`);
  console.error("then put it in .env.local and in your Vercel project settings.");
  process.exit(1);
}

/* Must stay in step with dashboardToken() in lib/jobs/auth.ts and the Web
   Crypto copy in middleware.ts. */
const token = createHash("sha256")
  .update(secret + ":job-radar-dashboard")
  .digest("hex")
  .slice(0, 32);

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
console.log(`${base}/opportunities?k=${token}`);
