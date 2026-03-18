import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Lazily initialised — missing env vars skip rate limiting (safe for local dev)
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

let _strict: Ratelimit | null = null;
let _moderate: Ratelimit | null = null;

function getLimiter(type: "strict" | "moderate"): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (type === "strict") {
    if (!_strict) {
      // 5 requests per 15 minutes — registration, coupon redemption
      _strict = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "rl:strict",
      });
    }
    return _strict;
  }

  if (!_moderate) {
    // 10 requests per 10 minutes — shift/job applications
    _moderate = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"),
      prefix: "rl:moderate",
    });
  }
  return _moderate;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Returns a 429 NextResponse if the rate limit is exceeded, otherwise null.
 * Safe no-op when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are unset.
 */
export async function checkRateLimit(
  req: NextRequest,
  type: "strict" | "moderate"
): Promise<NextResponse | null> {
  const limiter = getLimiter(type);
  if (!limiter) return null;

  const ip = getIp(req);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}
