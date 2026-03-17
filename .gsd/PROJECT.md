# Project

## What This Is

Tout Toilettage is a bilingual (FR/EN) marketplace platform for the Quebec professional pet grooming industry. Salons post shift replacements (paid with credits) and job openings ($49 flat fee). Groomers browse and apply. The platform includes a review system, training directory, subscription tiers (ESSENTIEL through CHAÎNE), open slot listings, and admin moderation.

Built with Next.js 14 App Router, TypeScript, Prisma/SQLite (PostgreSQL planned), NextAuth with role-based sessions (ADMIN/SALON/GROOMER), next-intl, Tailwind + shadcn/ui, UploadThing, and Resend for emails.

## Core Value

Single destination for Quebec grooming professionals — shifts, jobs, and now equipment classifieds — replacing fragmented Facebook groups.

## Current State

Core platform is stable and running. Shifts, jobs, reviews, training directory, credit system, subscription tiers, open slots, and admin moderation are all functional. Build passes with zero TypeScript errors across 76 routes. Known bugs documented in CLAUDE.md audit report (job rejection email, job publish payment guard, coupon TOCTOU race). Stripe not yet wired — payment is simulated.

## Architecture / Key Patterns

- **Routing:** `app/[locale]/...` with `next-intl` middleware, FR default
- **Auth:** NextAuth v5 with role-based sessions, `requireRole()` guard for pages, inline `auth()` checks in API routes
- **Business logic:** Centralized in `lib/` (credits.ts, notifications.ts, pricing.ts, reliability.ts, etc.)
- **API routes:** Thin — validate with Zod, delegate to lib, return JSON
- **Enum labels:** `lib/labels.ts` maps all enum values to `{ fr, en }` display strings
- **Uploads:** UploadThing with `ourFileRouter` in `app/api/uploadthing/core.ts`
- **Emails:** Fire-and-forget via Resend with `lib/notifications.ts`, HTML layout helper
- **Rate limiting:** Upstash Redis via `lib/rate-limit.ts`
- **SQLite arrays:** Stored as JSON strings (`specializations`, `criteriaTags`, `tags`), parsed in app code

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: Marketplace — Grooming equipment classifieds for Quebec professionals
