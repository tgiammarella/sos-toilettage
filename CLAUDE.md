# Project: Tout Toilettage Marketplace

## Core Stack (Stable Assumptions)

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Prisma v6
- SQLite (dev only)
- NextAuth with role-based sessions
- next-intl (FR default, EN secondary)
- Tailwind + shadcn/ui

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

Never bypass ledger tracking.

---

## Job Posting Rules

- Job postings do NOT use the credit system
- Flat fee: 49 $ CAD per posting
- Duration: 30 days visibility
- Flow: DRAFT → payment → PUBLISHED (expiresAt = now + 30 days)
- Expired jobs (expiresAt < now) become EXPIRED and hidden from public listings
- Stripe not wired yet — V1 simulates payment

---

## Shift Rules

- FILLED shifts must mask salon identity publicly
- Groomers cannot apply twice
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

Do not implement Stripe until explicitly instructed.

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

## Audit Report — 2026-03-16

Build status: PASS (zero TypeScript errors, all 76 routes compile)

### Bugs Found

#### Critical

1. **Job rejection email sends wrong data**
   `app/api/jobs/[id]/applications/[applicationId]/accept/route.ts:140` and `reject/route.ts:72`
   `notifyApplicationRejected()` is called with `shiftDate: job.title` — sends the job title where the email template expects a date.
   Fix: Create `notifyJobApplicationRejected()` with correct fields (jobTitle instead of shiftDate).

2. **Job publish route has no payment enforcement**
   `app/api/jobs/[id]/publish/route.ts` simulates payment success but has no guard preventing unlimited free publishing. Any salon can publish unlimited jobs by calling the endpoint directly.
   Fix: Add admin-only gate or credit-based check until Stripe is live.

#### Medium

3. **Coupon apply has TOCTOU race condition**
   `app/api/billing/apply-coupon/route.ts` — maxUses checked outside the transaction, usedCount incremented inside. Two concurrent requests could both pass.

4. **Job expiry logic runs on page load only**
   Expired jobs are auto-marked EXPIRED only when the salon visits their dashboard. Public /jobs page filters correctly but DB status stays PUBLISHED.

5. **Suggestions endpoint fetches ALL groomers**
   `app/api/shifts/[id]/suggestions/route.ts:52` — no WHERE clause, fetches every groomer. Will degrade at scale.

#### Low

6. Unused `CardHeaderSimple` function in groomer dashboard (dead code with void suppression).
7. Hardcoded French strings in JobDecisionButtons, ShiftForm errors, groomer dashboard discover section — affects EN users.
8. Missing rate limits on shifts POST, reviews POST, jobs publish.
9. Annual pricing comment misleading (monthly × 10 = 17% discount is correct but field naming is confusing).

### What's Working

- Credit system: atomic transactions, ledger tracking, 402 on insufficient
- Auth guards: all routes enforce correct roles
- Shift flow: DRAFT → PUBLISHED → FILLED → COMPLETED with proper state checks
- Review system: gated behind COMPLETED status, one review per engagement
- Reliability score: formula handles edge cases
- Quick apply: duplicate prevention client-side and server-side (409)
- Notifications: 12+ email functions, fire-and-forget with error logging
- Password reset: rate-limited, single-use tokens, no email enumeration
- Training directory: admin CRUD, public display with featured section
- Job posting: two-step creation (draft → publish), expiry filtering

---

## Launch Task List (Recommended Order)

### Phase 1 — Bug Fixes (Do First)

| # | Task | Severity | Effort |
|---|------|----------|--------|
| 1 | Fix job rejection email — create `notifyJobApplicationRejected` with correct fields | Critical | Small |
| 2 | Add payment guard to job publish — admin-only gate or credit deduction until Stripe | Critical | Small |
| 3 | Move coupon maxUses check inside transaction | Medium | Small |

### Phase 2 — Data Integrity

| # | Task | Effort |
|---|------|--------|
| 4 | Add `@@unique([shiftPostId, groomerId])` and `@@unique([jobPostId, groomerId])` to Application model | Small |
| 5 | Add explicit `onDelete` rules to Application, Engagement, CreditLedger relations | Small |
| 6 | Add scheduled job or middleware to auto-expire jobs (not just on salon dashboard visit) | Medium |

### Phase 3 — Production Readiness

| # | Task | Effort |
|---|------|--------|
| 7 | Wire Stripe for job posting payments ($49) and subscription plans | Large |
| 8 | Wire Stripe webhooks for credit pack purchases and monthly renewal | Large |
| 9 | Switch from SQLite to PostgreSQL — update datasource, test migrations, verify case-insensitive queries | Medium |
| 10 | Switch Resend sender from `onboarding@resend.dev` to verified custom domain | Small |
| 11 | Set up Upstash Redis for production rate limiting (replace in-memory) | Medium |
| 12 | Add environment variable validation on startup | Small |

### Phase 4 — UX Polish

| # | Task | Effort |
|---|------|--------|
| 13 | Internationalize remaining hardcoded French strings (JobDecisionButtons, ShiftForm, groomer dashboard) | Medium |
| 14 | Add pagination to shifts/jobs public listings and groomer suggestions endpoint | Medium |
| 15 | Add email verification flow for new accounts | Medium |
| 16 | Add `/contact` page (referenced by schools CTA but doesn't exist) | Small |
| 17 | Remove dead code (CardHeaderSimple, unused imports) | Small |

### Phase 5 — Growth Features (Post-Launch)

| # | Task | Effort |
|---|------|--------|
| 18 | Featured job listings (isFeatured in schema, needs UI + pricing) | Medium |
| 19 | Groomer availability calendar (beyond availableToday boolean) | Large |
| 20 | Notification preferences (opt-out of urgent alerts, email frequency) | Medium |
| 21 | Analytics dashboard for admins (user growth, shift fill rates, revenue) | Large |
| 22 | Mobile-responsive sidebar (currently hidden md:flex) | Medium |
