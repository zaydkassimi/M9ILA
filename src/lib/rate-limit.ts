import { headers } from "next/headers";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ENTRIES = 10000;

function cleanup() {
  if (store.size > MAX_ENTRIES) {
    const now = Date.now();
    for (const [key, entry] of Array.from(store.entries())) {
      if (entry.resetTime < now) {
        store.delete(key);
      }
    }
  }
}

export async function rateLimit(
  identifier: string,
  maxRequests: number = parseInt(process.env.RATE_LIMIT_MAX || "60"),
  windowMs: number = parseInt(process.env.RATE_LIMIT_WINDOW || "60") * 1000
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  cleanup();

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const key = `${identifier}:${ip}`;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetTime < now) {
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: entry.resetTime };
  }

  store.set(key, entry);
  return { success: true, limit: maxRequests, remaining: maxRequests - entry.count, reset: entry.resetTime };
}

export function getRetryAfterSeconds(resetTime: number): number {
  return Math.ceil((resetTime - Date.now()) / 1000);
}
