// ─── Shared in-memory rate limiter ────────────────────────────────────────────
// Resets on cold start and is not shared across Vercel serverless instances —
// acceptable for portfolio tooling, where the goal is blunting casual abuse
// rather than airtight quota enforcement.

const MAP_PRUNE_SIZE = 10_000;   // prune expired entries when a bucket exceeds this

interface Entry {
  count:   number;
  resetAt: number;
}

const buckets = new Map<string, Map<string, Entry>>();

const bucketFor = (name: string): Map<string, Entry> => {
  let bucket = buckets.get(name);
  if (!bucket) {
    bucket = new Map<string, Entry>();
    buckets.set(name, bucket);
  }
  return bucket;
};

/**
 * Returns true when `key` has already used its allowance inside the window.
 * Buckets are namespaced, so two routes sharing a caller IP limit separately.
 */
export function isRateLimited(
  bucketName: string,
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const bucket = bucketFor(bucketName);
  const now    = Date.now();
  const entry  = bucket.get(key);

  if (!entry || now > entry.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });

    // Prune expired entries to prevent unbounded memory growth
    if (bucket.size > MAP_PRUNE_SIZE) {
      for (const [k, v] of bucket) {
        if (now > v.resetAt) bucket.delete(k);
      }
    }
    return false;
  }

  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

/** First hop only — trusting the whole chain would let a caller spoof past the limit. */
export function callerIp(headers: Headers): string {
  return headers.get('cf-connecting-ip')
      ?? headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? 'unknown';
}
