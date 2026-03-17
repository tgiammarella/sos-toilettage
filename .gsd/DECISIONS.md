# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | scope | In-app messaging for marketplace | Deferred to V2 — email contact only | Reduces scope by ~25%. Email relay (Kijiji pattern) is sufficient for V1 launch. Messaging models can be added later. | Yes — when user volume justifies |
| D002 | M001 | data | Bilingual listing content fields | Single-language content (no titleFr/descriptionFr) | Rest of app stores content once. Forcing bilingual input per listing is adoption friction. UI chrome stays bilingual via next-intl. | Yes — if market demands |
| D003 | M001 | arch | Search implementation | Prisma `contains` on title + description | SQLite has no native FTS support. At V1 scale (<1000 listings) `contains` is adequate. Upgrade to PostgreSQL FTS when DB migrates. | Yes — at PostgreSQL migration |
| D004 | M001 | pattern | Multi-step form state | React state, submit once (no auto-save drafts) | Auto-save drafts adds DB complexity (partial records, cleanup). Matches existing shift/job creation patterns. | No |
| D005 | M001 | arch | Marketplace monetization | Independent from credit system | Credits are for shift publishing only. Marketplace has its own free tier limits tied to subscription plan. Paid boosts deferred to post-Stripe. | No |
| D006 | M001 | data | Image storage field in SQLite | JSON string (like specializations/criteriaTags) | SQLite doesn't support native String[]. Established pattern in codebase. Parse with JSON.parse/stringify in app code. | Yes — at PostgreSQL migration |
| D007 | M001 | arch | Seller contact mechanism | Email via Resend with reply-to buyer address | Simple, no new infrastructure, follows fire-and-forget notification pattern. Seller replies directly via email. | Yes — when in-app messaging ships |
