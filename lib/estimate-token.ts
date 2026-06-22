import crypto from "node:crypto";

// ─── Short-lived estimate token ────────────────────────────────────────────────
// Binds the email-delivery endpoint to a real estimate flow. `/api/estimate`
// issues a signed token on a successful estimate; `/api/estimate/send-email`
// requires it before sending mail. This prevents the send endpoint from being
// called standalone as an open email relay.
//
// Stateless HMAC (no DB/session): payload is the expiry timestamp, signed with a
// server-only secret. A token cannot be forged without the secret, and expires
// after TOKEN_TTL_MS.

const TOKEN_TTL_MS = 15 * 60_000; // 15 minutes

// Prefer a dedicated secret; fall back to GEMINI_API_KEY, which the estimate
// flow already requires (server-only, high entropy) so the feature works without
// extra env setup. Returns null only if neither is configured (fail closed).
function getSecret(): string | null {
  return process.env.ESTIMATE_TOKEN_SECRET ?? process.env.GEMINI_API_KEY ?? null;
}

/** Issue a short-lived signed token. Returns null if no secret is configured. */
export function signEstimateToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const payload = String(Date.now() + TOKEN_TTL_MS);
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Verify a token's signature and expiry. Fails closed on any malformed input. */
export function verifyEstimateToken(token: unknown): boolean {
  const secret = getSecret();
  if (!secret || typeof token !== "string") return false;

  const dot = token.indexOf(".");
  if (dot === -1) return false;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  // Timing-safe compare; guard against length mismatch (timingSafeEqual throws otherwise)
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expBuf);
}
