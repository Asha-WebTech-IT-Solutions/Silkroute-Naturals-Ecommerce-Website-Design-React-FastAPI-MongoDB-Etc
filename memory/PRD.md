# Silkroute Naturals — Product Requirements

## Original Problem Statement
Production-ready luxury heritage e-commerce for **Silkroute Naturals** (https://silkroutenaturals.com). 10 premium SKUs, Silk Route storytelling, custom nut butter builder, offline experience center, scalable. Must feel like ₹1L+ luxury (Aesop / Forest Essentials / L'Occitane / Tata Cliq Luxury).

## Stack
- React (CRA) + Tailwind + shadcn/ui + Recharts + Sonner + lucide-react
- FastAPI + MongoDB (motor) + JWT (httpOnly cookies + Bearer)
- Cormorant Garamond + Manrope fonts
- Razorpay payments — MOCKED until keys arrive
- SMTP mailer — wired via env, no-ops gracefully until credentials provided

## What's Implemented

### Iter 1 (25 Apr) — Initial MVP
13 storefront pages, 10-section admin dashboard, JWT auth, seed data, mailer-ready architecture. 35/35 backend pass.

### Iter 2 (25 Apr) — E-comm essentials
SEO per page (`useSEO` hook), search modal, wishlist (localStorage), forgot/reset password (1h TTL token, non-enumerating), mail notification system (`mailer.py` with brand HTML template — graceful no-op until SMTP set), `ScrollToTop`, hero polish, removed "Made with Emergent" badge. 44/44.

### Iter 3 (25 Apr) — Polish fixes
Hero H1 pixel-aligned with logo (`w-full` fix), fixed route-change rendering (CSS animation replaces JS IntersectionObserver), removed sticky on Shop filter & Builder sidebars. 44/44.

### Iter 4 (26 Apr) — Brand asset integration
Replaced text wordmark with actual gold ornate camel-caravan logo PNG in header/footer/admin. Integrated 10 brand photos (storefront sign, store interior, product packaging) across Home, Experience Center, Gifting. 44/44.

### Iter 5 (26 Apr) — Visual fixes + Guest Checkout
- **Hero**: switched to clean cream-silk Pexels backdrop + product still-life split (no more store-interior logo conflict)
- **Atelier section**: now uses `/product-detail.jpg` (no black bands)
- **Storefront section**: text shifted to LEFT, image `object-position: right center` so headline doesn't overlap the gold sign
- **Our Story hero**: cream-silk fabric overlay (no more orange map)
- **Experience Center photo strip**: 3 cropped views of `/store-interior.jpg` (no random Pexels mountains)
- **Guest Checkout**: `/api/orders` switched to `get_optional_user` with `guest: {email, name, phone}` fallback; frontend `/checkout` shows "Continue as guest" + "Sign in instead" link; new `/order-confirmed/:number` public confirmation page; guest orders get unique `guest_<id>` user_id; mailer fires order confirmation to guest email
- **49/49 backend pass** (added 5 TestGuestCheckout cases)

### Iter 7 (4 May) — Client feedback: branding + content + dark mode
- **Hero banner**: replaced AI-generated split hero with client-provided `/banner-desktop.png` (1568x672) + `/banner-mobile.jpg` (1536x1024) via `<picture>` element. Legacy hero retained behind `SHOW_LEGACY_HERO=false` feature flag (no code deletion).
- **Light/Dark mode toggle**: new `ThemeContext` + `.dark` CSS token overrides (black bg, cream text, brighter gold). Toggle button (Moon/Sun) in header; state persisted in `localStorage` as `srn-theme`.
- **Dynamic logos**: header + footer swap between `/logo-light.jpg` (gold on ivory) and `/logo-dark.jpg` (gold on black) based on theme.
- **Value props strip**: new 4-column row (Pure & Natural, Authentic Ingredients, Timeless Traditions, Ethically Sourced) mirroring the banner iconography.
- **Removed from homepage**: Experience Center section + "100 Ft Road, Indiranagar" section (gated behind `SHOW_EXPERIENCE_SECTION`/`SHOW_STOREFRONT_ADDRESS_SECTION` flags, kept for rollback).
- **Copy rewrite**: Our Story rewritten to remove "we pay above market", "families, not factories", "never bleach, never sulphur, never gloss" fabricated claims; replaced with grounded, human prose. Home hero tagline, atelier, quote, route-stop notes all rewritten.
- **Em-dash cleanup**: automated Python pass across all `.js/.jsx/.css` files — time ranges (`Tue — Sun`) converted to `Tue to Sun`, bullet dashes to `·`, prose ` — ` to `, `, placeholders to `-`. Zero em-dashes remain.
- **Brand name**: standardised as "Silk Route Naturals" (with space) matching logo in SEO title, OG meta, footer, aria labels.
- **Hostinger deployment Q&A**: user confirmed frontend-only on Hostinger Node.js. Pending user decisions for backend host + MongoDB Atlas setup.

## Test Credentials
- Admin: `admin@silkroutenaturals.com` / `Silkroute@2026`
- Customer: `customer@example.com` / `Customer@2026`

## Mocked / Pending External
- **Razorpay** — orders auto-mark `payment_status: paid`. Replace mock in `create_order` once keys arrive
- **SMTP** — set `SMTP_HOST/PORT/USER/PASSWORD/FROM` in `/app/backend/.env`. Emails wire up automatically.

## P0 / P1 / P2 Backlog
### P0
- Provide SMTP credentials → real emails
- Provide Razorpay keys → real checkout

### P1
- Backend-persisted wishlist (sync across devices)
- Login brute-force lockout
- Order tracking page with shipment timeline
- Admin order alert email
- Newsletter email-capture form

### P2
- Subscription / "Silkroute Society" recurring boxes
- Loyalty / rewards
- Multi-currency
- Mobile app
- AI product recommendations
- Reviews with photo uploads
