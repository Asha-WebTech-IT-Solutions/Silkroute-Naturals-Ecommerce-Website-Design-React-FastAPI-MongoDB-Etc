# Silk Route Naturals — PRD / Working Memory

## Original problem statement
Production-ready, premium e-commerce web app for luxury heritage superfood brand
"Silk Route Naturals": ~10 SKUs, custom nut butter builder, offline experience centre
showcase, luxury minimal design (beige/ivory/gold, serif), pages for Home, Shop, Product,
Our Story, Experience Centre, Nut Butter Builder, Corporate Gifting, Contact, Account,
Cart & Checkout, plus a custom admin panel. Stack: React SPA + FastAPI + MongoDB, JWT
auth, MOCKED Razorpay.

## Live architecture
- Frontend: CRA static build on Hostinger → https://silkroutenaturals.com (GitHub deploy, root dir `frontend`)
- Backend: FastAPI on Render → https://silkroute-naturals-ecommerce-website.onrender.com (free tier, sleeps)
- DB: MongoDB Atlas Cluster0, database `silkroutenaturals`
- Full go-live runbook: `/app/DEPLOYMENT.md`

## Implemented
- Auth (JWT in HttpOnly cookies, Secure + SameSite=None), account, addresses, wishlist
- Home, Shop (filters), Product detail + reviews, Nut Butter Builder, Gifting, Journal,
  Experience Centre, Contact, Cart, Checkout (payment MOCKED), Order detail
- Admin panel: products, orders, customers, coupons, banners, blog, bookings, gifting,
  custom orders, overview analytics
- Light/Dark theme (`ThemeContext.jsx`), brand banners/logos per theme
- SPA routing fallbacks (`public/.htaccess`, `public/_redirects`)
- Render/prod configs: `backend/requirements-prod.txt`, `backend/runtime.txt`

### 26 Jun 2026 — production blank-screen fix
- Root cause 1: Hostinger had no `REACT_APP_BACKEND_URL` → bundle built with `undefined`
  → `baseURL = "undefined/api"` → same-origin request → `.htaccess` returned `index.html`
  (HTTP 200, HTML string) → `products.slice(0,4).map is not a function` → blank screen.
- Root cause 2: backend CORS sent `Access-Control-Allow-Origin: *` with
  `withCredentials: true`, which browsers block; the live domain would have got no data
  even with a correct URL.
- Fixes: `src/lib/api.js` now has `resolveBackendUrl()` (validates env var, falls back to
  the Render URL on non-localhost hosts), an axios interceptor that rejects HTML
  responses, and a `getList()` helper that always returns an array; all 13 list fetches
  migrated to `getList`; Home has a skeleton + cold-start retry + empty state;
  `backend/server.py` CORS uses an explicit origin allow-list from `CORS_ORIGINS`/
  `FRONTEND_URL` plus regex for preview/localhost; committed `frontend/.env.production`
  (un-ignored in `.gitignore`) so GitHub builds bake the Render URL.
- Verified: `yarn build` clean, static build served locally rendered 4 featured + 11 shop
  products with zero page errors; CORS headers verified via curl for allowed/denied origins.
- Deliverable: `/app/silkroutenaturals-public_html.zip` (ready for Hostinger `public_html`).
- NOTE: Render must be redeployed for the CORS fix to take effect in production.

## Backlog
- P0: Product variation system (weight/size variants, per-variant price/SKU) across
  backend models, product page, cart, admin editor
- P0: Refactor admin panel into dedicated per-entity pages (Shopify style)
- P1: Admin analytics/reports
- P2: Order tracking timeline in `/account` → order
- P2: Link the 5 Silk Route country tiles on Home to Shop pre-filtered by origin
- P2: Replace MOCKED Razorpay with a live key; fill SMTP_* for real email
