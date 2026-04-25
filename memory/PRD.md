# Silkroute Naturals — Product Requirements

## Original Problem Statement
Build a production-ready, scalable, premium luxury e-commerce web application for **Silkroute Naturals** (https://silkroutenaturals.com) — a luxury heritage superfood brand. ~10 premium SKUs initially. Must feel like a ₹1L+ luxury experience brand (Aesop / Forest Essentials / L'Occitane / Tata Cliq Luxury), NOT a typical dry fruit store. Silk Route storytelling, custom nut butter builder, offline experience center, scalable to 100+ products.

## Stack
- Backend: FastAPI + MongoDB (motor) + JWT (httpOnly cookie + Bearer)
- Frontend: React (CRA) + React Router + Tailwind + shadcn/ui + Recharts + Sonner
- Fonts: Cormorant Garamond (serif) + Manrope (sans)
- Payments: Razorpay (MOCKED — keys to be added later)

## User Personas
1. **Discerning customer** — wants editorial storytelling, single-origin provenance, luxury feel
2. **Corporate gifting buyer** — bulk orders, branded packaging
3. **Atelier visitor** — books tasting sessions in Bengaluru
4. **Admin / brand owner** — manages catalog, orders, content, banners, analytics

## What's Implemented (Phase 1 — 25 Apr 2026)
### Storefront
- [x] Home — hero with antique map, marquee, route stops, featured products, atelier CTA, experience center, charter quote
- [x] Shop — grid with category/origin/sort filters
- [x] Product Detail — gallery, origin story, benefits, reviews (with submission)
- [x] Our Story — editorial narrative + 5 country stops
- [x] Experience Center — booking form (date/time/party/type)
- [x] Custom Nut Butter Builder — 6-step configurator with live pricing
- [x] Corporate Gifting — bulk inquiry form
- [x] Contact — form + map + atelier address
- [x] Account — order history, sign-out, admin link
- [x] Cart Drawer — qty/remove, subtotal
- [x] Checkout — address, coupon validation, mock Razorpay, order placement
- [x] Journal (Blog) — listing + detail with editorial layout

### Admin Dashboard (10 sections)
- [x] Overview — revenue, orders, customers, products + charts (revenue trend, top products)
- [x] Products CRUD
- [x] Orders — list + status update (confirmed → shipped → delivered)
- [x] Customers
- [x] Coupons CRUD + validation
- [x] Custom Nut Butter Orders
- [x] Bookings
- [x] Gifting Inquiries
- [x] Journal CMS
- [x] Banners

### Backend
- [x] JWT auth (cookies + Bearer fallback) — register/login/logout/me
- [x] 25+ API endpoints, all `/api/*` prefixed
- [x] Seed: admin user, test customer, 10 luxury products, 3 coupons, 4 blog posts, 2 banners
- [x] Stock decrement on order
- [x] Aggregated analytics endpoint (revenue, top products, daily trend)

### Tested
- 35/35 backend pytest cases pass (100%)
- Frontend critical paths verified

## P0 / P1 / P2 Backlog
### P0 (next sprint)
- Live Razorpay integration (need user's Key ID + Secret)
- Email notifications on order/booking (SendGrid/Resend)
- Image upload to S3 for admin product creation (currently URL-only)

### P1
- Search bar in header
- Wishlist
- Forgot/Reset password flow
- Brute-force lockout on login

### P2
- ERP / inventory deeper integration
- Mobile app
- Multi-currency
- Subscription boxes ("Silkroute Society")
- Loyalty / rewards

## Test Credentials
- Admin: `admin@silkroutenaturals.com` / `Silkroute@2026`
- Customer: `customer@example.com` / `Customer@2026`

## Mocked
- Razorpay payment — orders mark `payment_status: paid` automatically with `payment_method: "razorpay_mock"`. Replace in `/app/backend/server.py:create_order` once keys arrive.
