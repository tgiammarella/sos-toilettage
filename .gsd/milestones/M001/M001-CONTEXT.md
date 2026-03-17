# M001: Marketplace — Grooming Equipment Classifieds

**Gathered:** 2026-03-17
**Status:** Ready for planning

## Project Description

Add a grooming-specific classifieds marketplace to Tout Toilettage. Salons and groomers can list used equipment, tools, products, furniture, full salon buyouts, ISO requests, and exchanges. Seven categories, all Quebec grooming industry. No general classifieds.

## Why This Milestone

Quebec grooming professionals currently buy and sell equipment on fragmented Facebook groups — unsearchable, untrustworthy, no dedicated tooling. The marketplace makes Tout Toilettage the single destination for the entire professional grooming ecosystem, not just shifts and jobs. With an established user base of salons and groomers, classifieds add immediate value.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Browse and filter marketplace listings by category, condition, price, region
- Create a listing with multiple photos, see it appear in the browse page
- View a listing detail page with image gallery and contact the seller via email
- Manage their own listings (edit, mark sold, delete) within subscription tier limits
- Flag inappropriate listings; admin can review and moderate flagged content

### Entry point / environment

- Entry point: `/[locale]/marketplace` (browse), `/[locale]/marketplace/new` (create)
- Environment: local dev / browser
- Live dependencies involved: UploadThing (image hosting), Resend (email notifications)

## Completion Class

- Contract complete means: schema migration runs, all API routes return correct responses, Zod validation catches invalid input, tier limits enforced
- Integration complete means: UploadThing multi-image upload works end-to-end, Resend emails fire for contact/expiry/moderation
- Operational complete means: auto-expiry cron works, flagging auto-hides at threshold

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A user can create a listing with photos, see it in browse, and another user can contact the seller via email
- Tier limits prevent a free-tier user from exceeding 2 active listings or 3 photos
- Flagging a listing twice auto-hides it from browse; admin can restore or remove
- Auto-expiry cron marks listings EXPIRED and expiry warning email fires
- `npm run build` passes with zero TypeScript errors

## Risks and Unknowns

- **UploadThing multi-image** — Current setup only handles single PDF upload. Need to add a new file router endpoint for multiple images with different validation (image types, size limits, max count). Risk: image reordering UX in multi-step form.
- **SQLite array storage** — `images` field needs JSON string storage like existing `specializations`/`criteriaTags`. Not a true risk since the pattern is established, but must not use `String[]` type.
- **Free tier enforcement across roles** — Salons have `planKey` on SalonProfile. Groomers have no subscription — always get NONE tier limits. Need to handle both roles cleanly.

## Existing Codebase / Prior Art

- `prisma/schema.prisma` — All models, established JSON-string-for-arrays pattern
- `app/api/uploadthing/core.ts` — Existing file router with `cvUploader` endpoint
- `components/groomer/CvUploadButton.tsx` — Drag-and-drop upload component pattern
- `lib/notifications.ts` — 12+ email functions, fire-and-forget pattern with `send()` helper
- `lib/labels.ts` — Enum-to-bilingual-label maps, `getLang()` / `getLabel()` helpers
- `lib/pricing.ts` — Subscription tier definitions with `planKey`
- `lib/credits.ts` — Transaction pattern (marketplace does NOT use this)
- `app/[locale]/shifts/page.tsx` — Server component listing page pattern
- `components/open-slots/SlotFilters.tsx` — Client-side URL-param-based filter pattern
- `app/api/cron/expire-jobs/route.ts` — Cron endpoint pattern with CRON_SECRET auth
- `lib/auth-guards.ts` — `requireRole()` for page-level auth
- `app/[locale]/jobs/page.tsx` — Card-based listing page with badges

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — Browse listings with filters (S01)
- R002 — Create/edit listings with photos (S02)
- R003 — Listing detail with gallery (S03)
- R004 — Contact seller via email (S03)
- R005 — Manage own listings (S04)
- R006 — Free tier limits (S04)
- R007 — Flag listings (S05)
- R008 — Admin moderation queue (S05)
- R009 — Auto-expiry (S05)
- R010 — Bilingual UI strings (S06)
- R011 — Nav integration (S06)
- R012 — Seven categories (S01)
- R013 — Standardized Quebec regions (S01)

## Scope

### In Scope

- Prisma schema: MarketplaceListing, ListingFlag models + enums
- API routes: CRUD, mark sold, flag, contact seller, cron expiry
- Browse page with filters (category, condition, price, region, sort)
- Listing detail page with image gallery
- Multi-step create/edit form with UploadThing multi-image
- My Listings management page
- Free tier limit enforcement per subscription plan
- Admin flag moderation queue
- Email notifications: contact seller, expiry warning, listing removed, listing approved
- Auto-expiry cron endpoint
- Bilingual UI strings (FR/EN) for all marketplace chrome
- Navbar integration

### Out of Scope / Non-Goals

- In-app messaging (deferred to V2 — email contact only)
- Paid upgrades: boost, extend, extra photos (deferred to post-Stripe)
- Bilingual listing content (seller writes in one language)
- Auto-save drafts (form holds state in React)
- Similar listings carousel (deferred)
- Seller ratings / transaction completion tracking
- MarketplaceMessage model (not needed without in-app messaging)
- Live animals, non-grooming items

## Technical Constraints

- SQLite: no native arrays — `images` stored as JSON string, parsed in app code
- SQLite: no native full-text search — use Prisma `contains` for V1
- UploadThing: add `marketplaceImages` endpoint to existing `ourFileRouter`
- Images hosted via UploadThing, add UploadThing domains to `next.config.ts` `remotePatterns`
- Marketplace does NOT use the credit system — independent from shifts/jobs billing
- All bracket-route directories must be created with quoted paths

## Integration Points

- **UploadThing** — New `marketplaceImages` file route for multi-image upload
- **Resend** — New notification functions in `lib/notifications.ts`
- **Subscription tiers** — Read `planKey` from SalonProfile to determine free tier limits
- **Navbar** — Add Marketplace link to `components/nav/Navbar`
- **Labels** — Add marketplace enum labels to `lib/labels.ts`
- **i18n** — Add marketplace keys to `messages/fr.json` and `messages/en.json`

## Open Questions

- None — spec is detailed and user confirmed the simplified approach.
