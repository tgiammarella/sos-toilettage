# Project: Tout Toilettage Marketplace

## Core Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Prisma v6 + PostgreSQL (Neon)
- NextAuth with role-based sessions
- next-intl (FR default, EN secondary)
- Tailwind + shadcn/ui
- Resend (emails from info@touttoilettage.com)
- UploadThing (file uploads)
- Upstash Redis (rate limiting)
- Deployed on Vercel

Do not re-evaluate stack decisions unless explicitly asked.

---

## Roles

enum Role:
- ADMIN
- SALON
- GROOMER

All role logic must be enforced server-side.
Never rely on client-only checks.

---

## Credit System (Non-Negotiable Business Rules)

- Publishing a shift costs 1 credit
- Must execute inside a Prisma transaction
- If creditsAvailable < 1 → return HTTP 402
- Credit changes must write to CreditLedger
- CreditLedger uses:
  - amount (Int)
  - reason (String)
  - shiftId (optional)
  - type: CREDIT | DEBIT

SalonProfile fields:
- creditsAvailable Int @default(0)
- creditsMonthlyAllowance Int @default(0)
- planKey String @default("NONE") — maps to ESSENTIEL | SALON | RESEAU | CHAINE

Never bypass ledger tracking.

---

## Job Posting Rules

- Job postings do NOT use the credit system
- Flat fee: 49 $ CAD per posting
- Duration: 30 days visibility
- Flow: DRAFT → payment → PUBLISHED (expiresAt = now + 30 days)
- Expired jobs (expiresAt < now) become EXPIRED and hidden from public listings
- Publish route gated to ADMIN-only until Stripe is wired (returns 402 for non-admin)
- Cron endpoint at `/api/cron/expire-jobs` handles auto-expiry

---

## Shift Rules

- FILLED shifts must mask salon identity publicly
- Groomers cannot apply twice (enforced via `@@unique([shiftPostId, groomerId])`)
- Apply button must:
  - Redirect to login if anonymous
  - Hide for SALON/ADMIN
  - Show confirmation if already applied
- Shift status flow: DRAFT → PUBLISHED → FILLED → COMPLETED → ARCHIVED

---

## File System Rules (Tooling Constraint)

This project uses bracket routes:

- app/[locale]
- [id] dynamic segments

When creating directories:
- ALWAYS use quoted literal paths
- NEVER use glob patterns
- NEVER use brace expansion
- NEVER batch-create bracket paths in a single command

Example:
mkdir -p "app/[locale]/dashboard"

Do not violate this.

---

## Architecture Principles

- Keep business logic in lib/*
- API routes should remain thin
- Use transactions for atomic business operations
- No duplicated credit logic in routes
- Prefer server components where possible
- Only use client components when interactivity requires it
- Brand constants centralized in `lib/brand.ts`
- Email sender centralized: `lib/brand.ts` → `lib/resend.ts` → `lib/notifications.ts`
- Rate limiting via Upstash Redis (`lib/rate-limit.ts`), falls back to no-op when env vars missing
- Env validation at startup (`lib/env.ts`) — fails fast on missing required vars

---

## Build Discipline

Before declaring any slice complete:
1. Run `npm run build`
2. Ensure zero TypeScript errors
3. Ensure no route compilation failures

Never skip build verification.

---

## Stripe (Future Phase)

System must support:
- One-time credit packs
- Subscription-based monthly credit allowance
- Job posting payments (49 $ flat fee)

Stripe webhooks will call:
POST /api/credits/add

Stripe env vars present but not yet wired. Do not implement Stripe until explicitly instructed.

---

## Token Efficiency Mode

When working:
- Do not re-explain architecture
- Do not restate stack
- Do not re-list business rules
- Assume prior slices remain valid unless told otherwise
- Provide only actionable changes

Keep responses concise and implementation-focused.

---

## Audit Status — 2026-03-19

Build status: PASS (zero TypeScript errors, 98 routes compiled)
Database: PostgreSQL (Neon) — migrated from SQLite, clean reset
Deployment: Vercel — live
Email: Verified domain (info@touttoilettage.com via Resend)

### Fixed (from original audit)

1. ~~Job rejection email sends wrong data~~ — `notifyJobApplicationRejected()` created with correct fields
2. ~~Job publish route has no payment enforcement~~ — Admin-only gate with 402 until Stripe
3. ~~Coupon apply TOCTOU race condition~~ — All validation inside `$transaction`
4. ~~Application model missing unique constraints~~ — `@@unique([shiftPostId, groomerId])` and `@@unique([jobPostId, groomerId])` added
5. ~~Missing onDelete rules~~ — Explicit `onDelete: Cascade` or `SetNull` on all relations
6. ~~Job expiry runs on page load only~~ — Cron endpoint at `/api/cron/expire-jobs`
7. ~~Resend sender using onboarding@resend.dev~~ — Updated to verified domain
8. ~~No env variable validation~~ — `lib/env.ts` fails fast on missing required vars
9. ~~No contact page~~ — Built at `/[locale]/contact` with API route
10. ~~SQLite in production~~ — Migrated to PostgreSQL (Neon)

### Remaining Issues

#### Medium

1. **Suggestions endpoint fetches ALL groomers**
   `app/api/shifts/[id]/suggestions/route.ts` — no WHERE clause, fetches every groomer. Will degrade at scale.

#### Low

2. **Dead code** — `CardHeaderSimple` in `app/[locale]/dashboard/groomer/page.tsx` (unused, suppressed with void)
3. **Hardcoded French strings** — Some strings in JobDecisionButtons, ShiftForm errors, groomer dashboard not going through next-intl
4. **Missing rate limits** — shifts POST, reviews POST, jobs publish not rate-limited
5. **Pagination** — shifts/jobs public listings load all results

### What's Working

- Credit system: atomic transactions, ledger tracking, 402 on insufficient
- Auth guards: all routes enforce correct roles
- Shift flow: DRAFT → PUBLISHED → FILLED → COMPLETED with proper state checks
- Review system: gated behind COMPLETED status, one per engagement
- Reliability score: formula handles edge cases
- Quick apply: duplicate prevention client-side and server-side (409)
- Notifications: 12+ email functions, fire-and-forget with error logging
- Password reset: rate-limited, single-use tokens, no email enumeration
- Training directory: admin CRUD, public display with featured section
- Job posting: two-step creation (draft → publish), admin-gated publish, cron expiry
- Coupon system: TOCTOU-safe, single-use per salon enforcement
- Legal pages: privacy policy (Law 25), terms of service, cookie policy — all bilingual
- Partners page: static config, homepage strip, dedicated page
- Contact form: client-side form → API route → Resend email

---

## Remaining Launch Tasks

### Pre-Launch (Do Next)

| # | Task | Effort |
|---|------|--------|
| 1 | Wire Stripe for job posting payments ($49) and subscription plans | Large |
| 2 | Wire Stripe webhooks for credit pack purchases and monthly renewal | Large |
| 3 | Internationalize remaining hardcoded French strings | Medium |
| 4 | Add pagination to shifts/jobs public listings | Medium |
| 5 | Add WHERE clause to suggestions endpoint | Small |
| 6 | Add rate limits to shifts POST, reviews POST, jobs publish | Small |
| 7 | Remove dead code (CardHeaderSimple) | Small |

### Post-Launch

| # | Task | Effort |
|---|------|--------|
| 8 | Email verification flow for new accounts | Medium |
| 9 | Featured job listings (isFeatured in schema, needs UI + pricing) | Medium |
| 10 | Groomer availability calendar | Large |
| 11 | Notification preferences | Medium |
| 12 | Analytics dashboard for admins | Large |
| 13 | Mobile-responsive sidebar | Medium |
