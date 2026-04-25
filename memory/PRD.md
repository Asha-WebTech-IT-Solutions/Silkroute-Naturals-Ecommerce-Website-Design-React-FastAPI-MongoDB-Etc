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

### Iteration 1 — 25 Apr 2026 (initial MVP)
- Storefront: Home, Shop, Product Detail, Our Story, Experience Center, Custom Nut Butter Builder (6-step), Corporate Gifting, Contact, Account, Cart Drawer, Checkout, Journal listing/detail
- Admin Dashboard: Overview (Recharts analytics), Products CRUD, Orders, Customers, Coupons, Custom Orders, Bookings, Gifting Inquiries, Journal CMS, Banners
- Auth: JWT cookie+Bearer (register/login/logout/me)
- Seed: admin user, test customer, 10 luxury SKUs, 3 coupons, 4 blog posts, 2 banners
- Stock decrement on order, aggregated analytics
- 35/35 backend pytest pass

### Iteration 2 — 25 Apr 2026 (premium polish + e-comm essentials)
- **Hero redesign**: split-frame layout (cream copy block + luxury still-life on right) — text now perfectly legible
- **Made with Emergent badge removed** from index.html
- **ScrollToTop** on every route change (window.scrollTo on pathname change)
- **SEO per page** via `useSEO` hook — sets `<title>`, `<meta name="description">`, og:*, twitter:*, canonical, JSON-LD (Organization on Home, Product schema on PDP, Article on blog)
- **Search modal** — keyboard-accessible, debounced, popular-search chips, deep-links to product page
- **Wishlist** — localStorage-backed, heart toggle on cards + PDP, badge count in header, dedicated `/wishlist` page with add-to-cart
- **Forgot/Reset password** — `/forgot-password` & `/reset-password?token=...`, secure non-enumerating endpoint, 1h TTL token, single-use, MongoDB TTL index
- **Mail notification system** (`mailer.py`):
  - Welcome email on register
  - Order confirmation (with itemized table)
  - Order status updates (shipped/delivered/cancelled)
  - Password reset link
  - Booking received
  - Beautiful HTML template with brand styling
  - Graceful no-op (logs only) until SMTP env vars set
- 44/44 backend pytest pass

## Test Credentials
- Admin: `admin@silkroutenaturals.com` / `Silkroute@2026`
- Customer: `customer@example.com` / `Customer@2026`

## Mocked / Pending External
- **Razorpay payment** — orders mark `payment_status: paid` automatically
- **SMTP** — set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` in `/app/backend/.env`. Restart backend to activate. Code path already in place.

## P0 / P1 / P2 Backlog
### P0 (when creds arrive)
- Provide SMTP credentials → enable real emails
- Provide Razorpay live keys → enable real checkout

### P1 (next features)
- Backend-persisted wishlist (sync across devices when logged in)
- Login brute-force lockout (per /app/auth_testing.md)
- Order tracking page with shipment status
- Admin email notifications (new order alert)
- Newsletter signup → email capture form

### P2 (growth)
- Subscription / "Silkroute Society" recurring boxes
- Loyalty / rewards
- Multi-currency
- Mobile app
- ERP integration
- AI-powered product recommendations
