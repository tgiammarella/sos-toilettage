// Fail-fast environment variable validation — imported at app startup

const REQUIRED = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "RESEND_API_KEY",
] as const;

const OPTIONAL = [
  "STRIPE_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "CRON_SECRET",
] as const;

for (const name of REQUIRED) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

for (const name of OPTIONAL) {
  if (!process.env[name]) {
    console.warn(`[ENV] Optional variable not set: ${name}`);
  }
}
