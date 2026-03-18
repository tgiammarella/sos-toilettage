# Handoff Document — M001: Marketplace

**Date:** 2026-03-17
**Session:** Discussion + planning complete. No code written yet.

---

## What Happened This Session

Discussed and planned the Marketplace feature for Tout Toilettage. The user provided a detailed spec (`Marketplace.md`) and asked if I had a better plan. I proposed 6 changes from the spec:

1. **Single-language listing content** — dropped `titleFr`/`descriptionFr` (rest of app stores content once)
2. **Email contact instead of in-app messaging** — deferred messaging to V2 (saves ~25% effort)
3. **Prisma `contains` search** — not FTS (SQLite can't do it, scale doesn't need it)
4. **Vertical slices** — instead of the spec's layer-cake build order
5. **No auto-save drafts** — React state, submit once (matches existing patterns)
6. **Dropped similar listings carousel** — deferred to reduce scope

User approved all changes.

## Files Written

All in `.gsd/`:

| File | What it is |
|---|---|
| `PROJECT.md` | Living project description with current state |
| `REQUIREMENTS.md` | 13 active, 4 deferred, 3 out-of-scope requirements |
| `DECISIONS.md` | 7 architectural decisions (D001–D007) |
| `STATE.md` | Current position: plan S01 next |
| `milestones/M001/M001-CONTEXT.md` | Milestone context — risks, codebase references, scope |
| `milestones/M001/M001-ROADMAP.md` | 6 slices with boundary map |

Committed as: `docs(M001): context, requirements, and roadmap`

## No Code Written

Zero application code changed. Schema, routes, components — all untouched.

## Next Action

**Plan S01 (Schema + Browse Page)** — decompose into tasks, write `S01-PLAN.md` and individual `T01-PLAN.md` files, then execute.

To continue: run `/gsd` or `/gsd auto` in the project directory. The GSD state machine will read `STATE.md` and pick up at S01 planning.

## The 6 Slices (in order)

| # | Slice | Risk | Key deliverables |
|---|---|---|---|
| S01 | Schema + Browse Page | high | Prisma migration, `lib/marketplace.ts`, `GET /api/marketplace`, browse page with filters, seed data |
| S02 | Create/Edit + Photos | high | UploadThing multi-image, `POST /PATCH /api/marketplace`, multi-step form |
| S03 | Detail + Contact | medium | Listing detail page, image gallery, `POST /api/marketplace/[id]/contact`, email notification |
| S04 | My Listings + Tiers | medium | Management page, mark sold/delete, free tier limit enforcement |
| S05 | Flag + Mod + Expiry | low | Flag endpoint, admin queue, cron expiry, expiry warning email |
| S06 | Nav + i18n + Polish | low | Navbar link, all strings bilingual, mobile responsive, empty states |

## Key Codebase Facts for the Next Agent

- **SQLite arrays** are JSON strings — `images` field must be `String @default("[]")`, not `String[]`
- **UploadThing** is wired at `app/api/uploadthing/core.ts` — add `marketplaceImages` endpoint there
- **Notifications** follow fire-and-forget pattern in `lib/notifications.ts` — `send()` helper with `layout()` + `btn()` HTML builders
- **Enum labels** go in `lib/labels.ts` as `Record<string, Record<Lang, string>>` maps
- **Filters** use URL search params pattern — see `components/open-slots/SlotFilters.tsx`
- **Listing pages** are server components — see `app/[locale]/shifts/page.tsx` and `app/[locale]/jobs/page.tsx`
- **Auth in API routes** uses inline `auth()` check, not middleware
- **Auth in pages** uses `requireRole()` from `lib/auth-guards.ts`
- **Bracket routes** must use quoted paths: `mkdir -p "app/[locale]/marketplace"`
- **Marketplace does NOT touch credits** — independent monetization layer
- **Dev server** was running at `http://localhost:3000` during this session
- **Spec document** lives at `Marketplace.md` in project root — full data model, routes, UI spec
