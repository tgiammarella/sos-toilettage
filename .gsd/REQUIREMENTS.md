# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R001 — Browse marketplace listings with filters
- Class: primary-user-loop
- Status: active
- Description: Any visitor can browse grooming marketplace listings filtered by category, condition, price range, region, price type, and sorted by recent/price/featured.
- Why it matters: Core discovery loop — if users can't find what they're looking for, the marketplace is useless.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Search uses Prisma `contains` on title + description for V1. Cursor-based pagination, 20 per page.

### R002 — Create and edit listings with photos
- Class: primary-user-loop
- Status: active
- Description: Authenticated users (SALON or GROOMER) can create marketplace listings with title, description, category, condition, price, region, and upload multiple photos via UploadThing. Listings can be edited by the owner.
- Why it matters: Supply side — no listings, no marketplace.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Multi-step form. Photo count limited by subscription tier. Single-language content (not bilingual per listing). No auto-save drafts — form holds state in React, submits once.

### R003 — Listing detail page with image gallery
- Class: primary-user-loop
- Status: active
- Description: Each listing has a detail page showing all photos in a gallery/lightbox, full description, seller info card, similar listings, and flag button.
- Why it matters: Users need to evaluate items before contacting the seller.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: unmapped
- Notes: View count incremented on detail page load.

### R004 — Contact seller via email
- Class: core-capability
- Status: active
- Description: Authenticated users can contact a seller through a contact form on the listing detail page. Sends an email to the seller with the buyer's message and reply-to address. No in-app messaging in V1.
- Why it matters: Completes the buy-side loop — discovery → evaluation → contact.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Follows Kijiji/Craigslist email-relay pattern. Seller replies by email. In-app messaging deferred to V2.

### R005 — Manage own listings (my listings page)
- Class: core-capability
- Status: active
- Description: Sellers can view all their listings, edit them, mark as sold, or delete. Shows listing status (ACTIVE, SOLD, EXPIRED).
- Why it matters: Sellers need to manage lifecycle of their items.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: unmapped
- Notes: Accessible from dashboard or dedicated /marketplace/mes-annonces route.

### R006 — Free tier limits per subscription plan
- Class: core-capability
- Status: active
- Description: Active listing count, photos per listing, and listing duration are limited based on the user's subscription plan (NONE/ESSENTIEL/SALON/RESEAU/CHAINE). Enforce on creation and display limits in UI.
- Why it matters: Monetization lever — drives subscription upgrades. Also prevents spam from free accounts.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: M001/S02
- Validation: unmapped
- Notes: Limits from spec: NONE=2 active/3 photos/30 days, ESSENTIEL=5/5/60, SALON=10/8/60, RESEAU=25/10/90, CHAINE=unlimited/10/90. Groomers always get NONE tier limits (no subscription system for groomers).

### R007 — Flag listings for moderation
- Class: failure-visibility
- Status: active
- Description: Any authenticated user can flag a listing with a reason (SPAM, WRONG_CATEGORY, MISLEADING, INAPPROPRIATE, ALREADY_SOLD, OTHER). One flag per user per listing. When 2+ flags, listing auto-hides from public browse.
- Why it matters: Community self-policing — keeps marketplace quality high without admin reviewing every listing.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: unmapped
- Notes: Auto-hide sets hiddenAt timestamp; status stays ACTIVE. Admin can approve (clear flags) or remove.

### R008 — Admin moderation queue
- Class: admin/support
- Status: active
- Description: Admin sees a queue of flagged listings at /admin/marketplace with listing preview, flag count, flag reasons. Actions: approve (clear flags, restore), remove (set REMOVED), warn seller.
- Why it matters: Safety net for the flag system — admin makes final call.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: unmapped
- Notes: Follows existing admin dashboard patterns.

### R009 — Listing auto-expiry
- Class: continuity
- Status: active
- Description: Listings auto-expire when expiresAt < now via cron endpoint. Expiry duration set by subscription tier (30/60/90 days). Sellers receive email 7 days before expiry.
- Why it matters: Prevents stale listings from cluttering the marketplace.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: unmapped
- Notes: Follows existing /api/cron/expire-jobs pattern. CRON_SECRET bearer token auth.

### R010 — Bilingual UI strings
- Class: launchability
- Status: active
- Description: All marketplace UI strings (page titles, buttons, labels, filter options, empty states, error messages) available in FR and EN via next-intl.
- Why it matters: Platform is bilingual — marketplace must be too or it breaks the experience for EN users.
- Source: inferred
- Primary owning slice: M001/S06
- Supporting slices: all slices
- Validation: unmapped
- Notes: Listing content itself is single-language (seller's choice). Only UI chrome is bilingual.

### R011 — Marketplace nav integration
- Class: launchability
- Status: active
- Description: Marketplace link added to main navbar between existing items. Visible to all users.
- Why it matters: Users need to find the marketplace.
- Source: inferred
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: unmapped
- Notes: Navbar component at components/nav/Navbar.

### R012 — Seven grooming-specific categories
- Class: constraint
- Status: active
- Description: Listings are categorized into exactly 7 types: EQUIPMENT, TOOLS, PRODUCTS, FURNITURE, FULL_SALON, ISO, EXCHANGE. No general classifieds.
- Why it matters: Keeps marketplace focused on grooming industry — differentiator vs generic platforms.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Categories enforced at schema level via enum.

### R013 — Quebec regions standardized dropdown
- Class: constraint
- Status: active
- Description: Region selection uses a fixed list of 14 Quebec regions (montreal, rive-sud, rive-nord, laval, quebec-city, etc.) — not free text.
- Why it matters: Consistent filtering — free text creates duplicates (Montréal vs Montreal vs MTL).
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S02
- Validation: unmapped
- Notes: Region list defined in Marketplace.md spec. Bilingual display names.

## Deferred

### R020 — In-app messaging system
- Class: core-capability
- Status: deferred
- Description: Private messaging between buyer and seller scoped to a listing. Inbox page, conversation threads, read receipts.
- Why it matters: Better UX than email relay for high-volume sellers. Keeps conversations on-platform.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to V2. V1 uses email contact. Schema models (MarketplaceMessage) can be added later.

### R021 — Paid listing upgrades (boost, extend, extra photos)
- Class: differentiator
- Status: deferred
- Description: Paid upgrades: boost listing ($4.99/7 days), extend duration ($2.99/+30 days), extra photo slots ($1.99/+5 photos).
- Why it matters: Revenue stream from marketplace beyond subscriptions.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred until Stripe is wired. Free tier limits ship in V1.

### R022 — Seller trust signals
- Class: differentiator
- Status: deferred
- Description: Response rate badge, verified professional badge for subscribed accounts, member-since date on listings.
- Why it matters: Builds buyer confidence.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Member-since date will ship in V1 (available from User.createdAt). Response rate and verified badge deferred.

### R023 — Similar listings carousel
- Class: differentiator
- Status: deferred
- Description: On listing detail page, show carousel of similar listings (same category, same region).
- Why it matters: Discovery and engagement.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred to reduce S03 scope. Can be added post-launch.

## Out of Scope

### R030 — Live animals or pets
- Class: anti-feature
- Status: out-of-scope
- Description: No listing of live animals on the marketplace.
- Why it matters: Legal liability, ethical concerns, brand risk.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Explicitly excluded in spec.

### R031 — Non-grooming items
- Class: anti-feature
- Status: out-of-scope
- Description: No general classifieds — furniture, electronics, clothing, etc. not related to grooming.
- Why it matters: Keeps marketplace focused and differentiated.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Enforced by category enum.

### R032 — Seller ratings / transaction completion
- Class: differentiator
- Status: out-of-scope
- Description: Rating sellers after a purchase/transaction is complete.
- Why it matters: Post-V1 feature — needs transaction tracking first.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Listed in spec's "Post-V1 Ideas."

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | primary-user-loop | active | M001/S01 | none | unmapped |
| R002 | primary-user-loop | active | M001/S02 | none | unmapped |
| R003 | primary-user-loop | active | M001/S03 | none | unmapped |
| R004 | core-capability | active | M001/S03 | none | unmapped |
| R005 | core-capability | active | M001/S04 | none | unmapped |
| R006 | core-capability | active | M001/S04 | M001/S02 | unmapped |
| R007 | failure-visibility | active | M001/S05 | none | unmapped |
| R008 | admin/support | active | M001/S05 | none | unmapped |
| R009 | continuity | active | M001/S05 | none | unmapped |
| R010 | launchability | active | M001/S06 | all | unmapped |
| R011 | launchability | active | M001/S06 | none | unmapped |
| R012 | constraint | active | M001/S01 | none | unmapped |
| R013 | constraint | active | M001/S01 | M001/S02 | unmapped |
| R020 | core-capability | deferred | none | none | unmapped |
| R021 | differentiator | deferred | none | none | unmapped |
| R022 | differentiator | deferred | none | none | unmapped |
| R023 | differentiator | deferred | none | none | unmapped |
| R030 | anti-feature | out-of-scope | none | none | n/a |
| R031 | anti-feature | out-of-scope | none | none | n/a |
| R032 | differentiator | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 13
- Mapped to slices: 13
- Validated: 0
- Unmapped active requirements: 0
