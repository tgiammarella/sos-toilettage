# M001: Marketplace — Grooming Equipment Classifieds

**Vision:** Add a grooming-specific classifieds marketplace to Tout Toilettage where Quebec salons and groomers can list, browse, and trade used equipment, tools, products, and full salon setups — replacing fragmented Facebook groups with a searchable, moderated, bilingual platform.

## Success Criteria

- User can browse marketplace listings with functional filters (category, condition, price, region)
- User can create a listing with multiple photos and see it appear in browse results
- User can view listing detail with image gallery and contact the seller via email
- Seller can manage their own listings (edit, mark sold, delete)
- Free tier limits enforced: listing count, photo count, and duration per subscription plan
- Flagging auto-hides listings at 2+ flags; admin can approve or remove
- Listings auto-expire via cron; expiry warning email sent 7 days before
- All UI strings bilingual (FR/EN); `npm run build` passes with zero errors

## Key Risks / Unknowns

- **UploadThing multi-image upload** — Existing setup handles single PDF only. Multi-image with reordering is new territory in this codebase.
- **Tier limit enforcement** — Salons have `planKey`, groomers don't. Need clean abstraction for both roles.

## Proof Strategy

- UploadThing multi-image → retire in S02 by proving a user can upload multiple images and see them stored on the listing
- Tier limit enforcement → retire in S04 by proving a NONE-tier user is blocked at 2 active listings and 3 photos

## Verification Classes

- Contract verification: Zod validation, API response codes, Prisma queries, build pass
- Integration verification: UploadThing image upload end-to-end, Resend email delivery
- Operational verification: cron expiry endpoint, flag auto-hide threshold
- UAT / human verification: visual review of browse page, listing detail, create form UX

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 6 slices are complete with passing verification
- Schema migration applied, all API routes functional
- UploadThing multi-image upload works end-to-end
- Free tier limits enforced correctly per subscription plan
- Flag → auto-hide → admin moderation flow works
- Auto-expiry cron marks listings EXPIRED
- Marketplace link in navbar, all UI strings bilingual
- `npm run build` passes with zero TypeScript errors

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013
- Partially covers: none
- Leaves for later: R020 (in-app messaging), R021 (paid upgrades), R022 (trust signals), R023 (similar carousel)
- Orphan risks: none

## Slices

- [ ] **S01: Schema + Browse Page** `risk:high` `depends:[]`
  > After this: visitor can see seeded marketplace listings on /marketplace, filter by category/region/condition, paginated

- [ ] **S02: Create/Edit Listing + Photos** `risk:high` `depends:[S01]`
  > After this: authenticated user can create a listing with up to N photos via UploadThing, listing appears in browse

- [ ] **S03: Listing Detail + Contact Seller** `risk:medium` `depends:[S01]`
  > After this: user can view full listing detail with image gallery and contact seller via email notification

- [ ] **S04: My Listings + Tier Limits** `risk:medium` `depends:[S01,S02]`
  > After this: seller can manage own listings from /marketplace/mes-annonces; free tier limits enforced on creation

- [ ] **S05: Flagging + Moderation + Expiry** `risk:low` `depends:[S01]`
  > After this: users can flag listings, admin can review at /admin/marketplace, auto-expiry cron works with email warning

- [ ] **S06: Nav + i18n + Polish** `risk:low` `depends:[S01,S02,S03,S04,S05]`
  > After this: marketplace link in navbar, all strings bilingual, mobile responsive, empty states polished

## Boundary Map

### S01 → S02

Produces:
- `prisma/schema.prisma` → MarketplaceListing model, ListingFlag model, MarketplaceCategory/ItemCondition/PriceType/ListingStatus/FlagReason enums
- `lib/marketplace.ts` → `getMarketplaceListings()` query with filters, `getListingById()`, Quebec regions constant (`QUEBEC_REGIONS`)
- `lib/labels.ts` → Marketplace enum label maps (MARKETPLACE_CATEGORY_LABEL, ITEM_CONDITION_LABEL, PRICE_TYPE_LABEL, LISTING_STATUS_LABEL)
- `GET /api/marketplace` → public listing query endpoint with filter params
- `app/[locale]/marketplace/page.tsx` → browse page with filter UI
- Seed data for development testing

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- `lib/marketplace.ts` → `getListingById()` with view count increment
- MarketplaceListing model with all fields

Consumes:
- nothing (first slice)

### S01 → S05

Produces:
- ListingFlag model with FlagReason enum
- ListingStatus enum (ACTIVE, SOLD, EXPIRED, REMOVED)

Consumes:
- nothing (first slice)

### S02 → S04

Produces:
- `app/api/uploadthing/core.ts` → `marketplaceImages` file route
- `POST /api/marketplace` → create listing endpoint
- `PATCH /api/marketplace/[id]` → update listing endpoint
- `app/[locale]/marketplace/new/page.tsx` → create form
- `app/[locale]/marketplace/[id]/edit/page.tsx` → edit form

Consumes from S01:
- MarketplaceListing model
- `lib/marketplace.ts` → `getListingById()`
- Marketplace enum labels

### S03 → S06

Produces:
- `app/[locale]/marketplace/[id]/page.tsx` → listing detail page
- `POST /api/marketplace/[id]/contact` → contact seller endpoint
- `lib/notifications.ts` → `notifyMarketplaceContact()` email function
- Image gallery component

Consumes from S01:
- `lib/marketplace.ts` → `getListingById()` with view count increment
- MarketplaceListing model

### S04 → S06

Produces:
- `app/[locale]/marketplace/mes-annonces/page.tsx` → my listings page
- `POST /api/marketplace/[id]/sold` → mark as sold endpoint
- `DELETE /api/marketplace/[id]` → delete listing endpoint
- `lib/marketplace.ts` → `getMarketplaceTierLimits()` function, `getUserActiveListingCount()`

Consumes from S01:
- MarketplaceListing model, ListingStatus enum
- `lib/marketplace.ts` → `getListingById()`
Consumes from S02:
- Create/edit listing endpoints and forms

### S05 → S06

Produces:
- `POST /api/marketplace/[id]/flag` → flag listing endpoint
- `app/[locale]/admin/marketplace/page.tsx` → admin moderation queue
- `GET /api/cron/expire-listings` → cron expiry endpoint
- `lib/notifications.ts` → `notifyListingExpiringSoon()`, `notifyListingRemoved()`, `notifyListingApproved()` email functions

Consumes from S01:
- ListingFlag model, FlagReason enum, ListingStatus enum
- `lib/marketplace.ts` → `getListingById()`
