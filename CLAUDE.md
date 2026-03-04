# Project: SOS Toilettage Marketplace

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

## Shift Rules

- FILLED shifts must mask salon identity publicly
- Groomers cannot apply twice
- Apply button must:
  - Redirect to login if anonymous
  - Hide for SALON/ADMIN
  - Show confirmation if already applied

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