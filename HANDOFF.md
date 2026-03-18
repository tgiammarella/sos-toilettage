# Tout Toilettage — Handoff Document

**Date:** 2026-03-17
**Build status:** PASS (zero TypeScript errors, 95 routes compiled)
**Uncommitted changes:** 60 files changed, 3642 insertions, 1115 deletions (from initial MVP commit)

---

## 1. What Was Done This Session

### A. Full Brand Color Reset

The entire app was migrated from incorrect/mixed colors to the official brand palette. Every hardcoded color value was replaced across 42+ files.

**Official palette (defined in `app/globals.css` as CSS variables + Tailwind tokens):**

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#055864` | Primary teal — CTAs, buttons, hero bg, nav links, FR toggle |
| `--secondary` / `--accent` | `#3A7F87` | Secondary teal — accents, toggle badges |
| `--background` | `#E8D2AE` | Sand — page background |
| `--card` / `--muted` | `#F6EFE6` | Light bg — cards, soft badges |
| `--border` | `#CBBBA6` | Border/divider color |
| `--foreground` | `#1F2933` | Dark text — all headings |
| `--muted-foreground` | `#4a6260` | Secondary text — body, descriptions |
| `--destructive` | `#C0392B` | Error/urgent red |

**Brand tokens available as Tailwind classes:** `brand-teal`, `brand-teal-secondary`, `brand-heading`, `brand-body`, `brand-sand`, `brand-light`, `brand-border`, `brand-urgent`

**Where hardcoded colors are used (instead of theme vars):**
- Headings: `text-[#1F2933]` — used in all 40+ page h1/h2 elements
- Body text: `text-[#4a6260]` — descriptions, subtitles, metadata
- Badges (species/criteria): `bg-[#F6EFE6] text-[#055864]`
- Job type badges: `bg-[#d1ede6]` (full-time), `bg-[#fef3c7]` (part-time), `bg-[#f1f5f9]` (contract)
- Hero CTA buttons: `bg-[#E8D2AE] text-[#055864]` with inline style override
- Outline buttons (pricing): `border-[#055864] text-[#055864]`

### B. Navbar Fixes

**File:** `components/nav/Navbar.tsx`
- Nav links use `text-[#055864]` (hardcoded, not theme var)
- Connexion link is a plain `<Link>` styled with `text-[#055864]`
- Inscription button uses `<Button size="sm">` (default variant = `bg-primary`)
- Mobile nav mirrors desktop styles

**File:** `components/nav/LocaleToggle.tsx`
- Active locale uses `variant="default"` = `bg-primary` (`#055864`)
- Inactive locale uses `variant="ghost"`

### C. UI Consistency Fixes

- **All cards** use `bg-white` or `bg-[#F6EFE6]` (via `--card`), never beige
- **Urgent shift cards**: white bg + `border-l-[3px] border-l-[#dc2626]` left border
- **School type badges**: inline `<span>` with `bg-[#F6EFE6] text-[#055864]`
- **Pricing discover box**: solid `border-[1.5px] border-[#055864]` (was dashed)
- **Pricing step cards**: `bg-white` (was beige)
- **Schools header banner**: `bg-white` (was tinted)

### D. Bug Fixes Verified

All three CLAUDE.md audit bugs were already fixed in the codebase:

1. **Job rejection email** — `notifyJobApplicationRejected()` exists with correct `jobTitle`/`jobCity` fields
2. **Job publish guard** — Returns 402 for non-ADMIN users
3. **Coupon TOCTOU** — All validation runs inside `prisma.$transaction`

### E. New Features Built

#### Partners System
- **`lib/partners.ts`** — Static partner config (type + data array)
- **`public/partners/placeholder.svg`** — Placeholder logo SVG
- **`app/[locale]/partenaires/page.tsx`** — Public partners page with card grid, promo code badges, CTA
- **Homepage partners strip** — "Ils nous font confiance" section with grayscale logos + "Voir tous nos partenaires" link
- **i18n**: `partners` namespace in both FR/EN message files

#### Contact Page + API
- **`app/[locale]/contact/page.tsx`** — Client-side form with name, email, subject select, message textarea
- **`app/api/contact/route.ts`** — Sends email via Resend to `info@touttoilettage.com`
  - From: `ToutToilettage <info@touttoilettage.com>`
  - ReplyTo: sender's email address
  - HTML body with XSS escaping (`escapeHtml()` helper)
  - Graceful fallback when `RESEND_API_KEY` is unset (logs to console)
- **i18n**: `contact` namespace in both FR/EN message files
- **Footer**: "Contact" link in homepage footer

#### Navbar Link Changes
- Removed `disponibilites` from nav links array
- Updated `open_slots` label in `fr.json` to "Rendez-vous de toilettage disponibles"

---

## 2. Key Files Changed

### Config / Theme
| File | What |
|------|------|
| `app/globals.css` | Full palette reset — CSS variables, brand tokens, dark mode |

### Navigation
| File | What |
|------|------|
| `components/nav/Navbar.tsx` | Hardcoded `#055864` nav links, removed disponibilites link |
| `components/nav/LocaleToggle.tsx` | Active = `variant="default"` (picks up `bg-primary`) |

### New Pages
| File | What |
|------|------|
| `app/[locale]/partenaires/page.tsx` | Partners listing page |
| `app/[locale]/contact/page.tsx` | Contact form (client component) |
| `app/api/contact/route.ts` | Contact form API → Resend email |

### New Libraries / Assets
| File | What |
|------|------|
| `lib/partners.ts` | Partner type + static data |
| `public/partners/placeholder.svg` | Placeholder partner logo |

### i18n
| File | What |
|------|------|
| `messages/fr.json` | Added `contact`, `partners` namespaces; updated `nav.open_slots` |
| `messages/en.json` | Added `contact`, `partners` namespaces |

### Pages Updated (Color/UI) — 42 files
Every page under `app/[locale]/` was updated for heading colors (`#1F2933`), body text (`#4a6260`), badge styles (`#F6EFE6`/`#055864`), and card backgrounds. Key ones:

- `app/[locale]/page.tsx` — Hero buttons, feature cards, how-it-works, partners strip, footer
- `app/[locale]/pricing/page.tsx` — All section headings, step cards, discover box, FAQ, social proof
- `app/[locale]/shifts/page.tsx` — Heading, urgent card border, criteria badges translated
- `app/[locale]/jobs/page.tsx` — Heading, employment type badges styled
- `app/[locale]/schools/page.tsx` — Header banner, type badges, body text
- `components/pricing/PricingPlansSection.tsx` — Tier card headings, prices, outline buttons
- All 29 dashboard pages under `salon/`, `groomer/`, `admin/`

---

## 3. What Still Needs Doing

### Immediate
- [ ] **Commit all changes** — 60 files are uncommitted
- [ ] **Verify Resend domain** — Contact form uses `info@touttoilettage.com` as sender; domain must be verified in Resend dashboard or emails will bounce
- [ ] **Add real partner logos** — Currently using placeholder SVG at `/public/partners/placeholder.svg`
- [ ] **Test contact form end-to-end** — Requires `RESEND_API_KEY` env var

### From CLAUDE.md Launch Task List

**Phase 2 — Data Integrity:**
- Add `@@unique` constraints on Application model
- Add explicit `onDelete` rules
- Add scheduled job for auto-expiring jobs (currently only on dashboard visit)

**Phase 3 — Production Readiness:**
- Wire Stripe for job posting payments ($49) and subscription plans
- Wire Stripe webhooks for credit packs and monthly renewal
- Switch SQLite → PostgreSQL
- Switch Resend sender from `onboarding@resend.dev` to verified custom domain (for notifications; contact form already uses `info@touttoilettage.com`)
- Set up Upstash Redis for rate limiting (currently in-memory)
- Add environment variable validation

**Phase 4 — UX Polish:**
- Internationalize remaining hardcoded French strings (JobDecisionButtons, ShiftForm, groomer dashboard)
- Add pagination to shifts/jobs listings
- Add email verification flow
- Remove dead code (`CardHeaderSimple` in groomer dashboard)

**Phase 5 — Growth:**
- Featured job listings
- Groomer availability calendar
- Notification preferences
- Analytics dashboard

---

## 4. Architecture Notes for Next Developer

### Color System
The app uses a **dual approach** for colors:
1. **CSS variables** in `globals.css` for shadcn/ui components (`--primary`, `--card`, etc.)
2. **Hardcoded hex values** in Tailwind classes for brand-critical elements (`text-[#1F2933]`, `bg-[#055864]`)

This is intentional — the hardcoded values prevent theme overrides from breaking the brand. If you need to change the brand palette, update BOTH the CSS variables AND grep for the old hex values.

### Contact Form
- API route at `/api/contact` — no auth required
- Uses existing Resend instance from `lib/resend.ts` but overrides the `from` address
- XSS-safe via `escapeHtml()` helper
- Falls back to console logging if `RESEND_API_KEY` is missing

### Partners System
- Static config in `lib/partners.ts` — no database needed
- To add a partner: add entry to the array, drop logo in `/public/partners/`
- Featured partners appear on homepage strip; all partners appear on `/partenaires`
- Promo codes display as badges on partner cards

### Bracket Routes
Always use quoted paths when creating directories: `mkdir -p "app/[locale]/new-page"`

---

## 5. Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxxx          # Email sending (contact form + notifications)
AUTH_URL=https://yourapp.com    # Used in email links
AUTH_SECRET=xxx                 # NextAuth secret
DATABASE_URL=file:./dev.db      # SQLite for dev

# Not yet needed (future)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 6. How to Run

```bash
cd /Users/tgiam/sos-toilettage
npm install
npx prisma migrate dev     # Apply migrations
npx prisma db seed         # Seed sample data
npm run dev                # http://localhost:3000
npm run build              # Verify zero errors (currently passes)
```
