# Silk Route Naturals — Production Deployment Guide

Architecture
- Frontend: React (CRA) static build on Hostinger → https://silkroutenaturals.com
- Backend: FastAPI web service on Render → https://silkroute-naturals-ecommerce-website.onrender.com
- Database: MongoDB Atlas (Cluster0, database `silkroutenaturals`)

---

## 0. The blank-screen bug (fixed on 26 Jun 2026)

Two separate production faults, both fixed in code:

1. Hostinger had **no** `REACT_APP_BACKEND_URL`, so the bundle built with `undefined`.
   `src/lib/api.js` produced `baseURL = "undefined/api"`, axios resolved that against
   your own domain, the `.htaccess` SPA rule answered with `index.html` (HTTP 200), and
   `products` became an HTML **string** → `products.slice(0,4).map is not a function`.
   Fix: `resolveBackendUrl()` validates the env var and falls back to the Render URL on
   any non-localhost host; a committed `frontend/.env.production` also bakes the correct
   URL at build time; an axios interceptor now rejects HTML responses; `getList()`
   guarantees an array for every list endpoint.
2. The backend sent `Access-Control-Allow-Origin: *` while the frontend sends cookies
   (`withCredentials: true`). Browsers block that combination, so even with the right
   URL the live site would have received zero data. Fix: explicit origin allow-list.

**Both the backend (Render) and the frontend (Hostinger) must be redeployed.**

---

## 1. MongoDB Atlas

Already provisioned; verify these only.

1. cloud.mongodb.com → Cluster0 → **Network Access** → IP Access List must contain
   `0.0.0.0/0` (Render free tier has no static outbound IP). Description: "Render".
2. **Database Access** → user `silkroutenaturals_db_user` with role `readWriteAnyDatabase`
   (or `readWrite` on `silkroutenaturals`).
3. **Database** → `silkroutenaturals` should hold: products (10), users (2), banners,
   blog_posts, coupons, orders, password_reset_tokens.
4. Connection string used by Render:
   `mongodb+srv://<user>:<password>@cluster0.fp94e2k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
5. Backups: Atlas M0 has no backups. If this becomes a real store, upgrade to M10 or
   schedule `mongodump` weekly.

---

## 2. Render backend

Settings → Build & Deploy
| Field | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Python 3 (from `runtime.txt` → 3.11.10) |
| Build Command | `pip install -r requirements-prod.txt` |
| Start Command | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| Auto-Deploy | On Commit (recommended) |

Environment variables (Render → Environment)
```
MONGO_URL        = mongodb+srv://silkroutenaturals_db_user:<password>@cluster0.fp94e2k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME          = silkroutenaturals
JWT_SECRET       = <long random string, keep the existing one>
ADMIN_EMAIL      = admin@silkroutenaturals.com
ADMIN_PASSWORD   = <your admin password>
FRONTEND_URL     = https://silkroutenaturals.com
CORS_ORIGINS     = https://silkroutenaturals.com,https://www.silkroutenaturals.com
```
`CORS_ORIGINS` is the one you are missing — add it. (The code also hard-defaults to both
domains, so it will work either way, but keep it explicit.)
SMTP_* variables are optional; while empty, emails silently no-op.

After adding it: **Manual Deploy → Deploy latest commit** so the new CORS code ships.

Verify
```
curl -s https://silkroute-naturals-ecommerce-website.onrender.com/api/
curl -s -i -H "Origin: https://silkroutenaturals.com" \
  https://silkroute-naturals-ecommerce-website.onrender.com/api/products | grep -i access-control
```
Expected: `access-control-allow-origin: https://silkroutenaturals.com` and
`access-control-allow-credentials: true`. If you still see `*`, the deploy did not pick
up the new code.

Free-tier note: the instance sleeps after inactivity and the first request can take
50–60s. The homepage now shows a skeleton and retries twice, so a cold start looks like
loading rather than an error. Upgrade to the $7 Starter plan to remove the sleep — this
also fixes slow first-load for real customers.

---

## 3. Hostinger frontend

Environment variables (Hostinger → your site → Environment variables → Add)
```
REACT_APP_BACKEND_URL = https://silkroute-naturals-ecommerce-website.onrender.com
```
Add it, then **Deployments → Redeploy**. Root directory stays `frontend`, framework
Create React App, Node 22.x.

If you prefer to upload the build by hand instead of the GitHub deploy:
1. Take `silkroutenaturals-public_html.zip` (produced by `yarn build`).
2. Hostinger → Files → File Manager → `public_html` → delete old contents → upload the
   zip → Extract. `.htaccess` must exist at the root of `public_html` (it is inside the
   zip; enable "show hidden files" to confirm).

Build locally with:
```
cd frontend
REACT_APP_BACKEND_URL=https://silkroute-naturals-ecommerce-website.onrender.com yarn build
```
(`craco.config.js` calls `dotenv.config()`, which makes the local `.env` win over
`.env.production`, so pass the variable inline when building for production.)

---

## 4. Domain / SSL / DNS

- silkroutenaturals.com and www both pointed at Hostinger, SSL active (Hostinger → SSL).
- Force HTTPS on. Cookies are issued as `Secure; SameSite=None`, so the site only
  authenticates over HTTPS.
- Decide on one canonical host (recommended: redirect www → apex) so cookies and SEO
  stay on a single domain.

---

## 5. Go-live checklist

- [ ] Atlas Network Access allows 0.0.0.0/0
- [ ] `CORS_ORIGINS` added on Render, latest commit deployed
- [ ] `/api/products` returns JSON with the correct `access-control-allow-origin`
- [ ] `REACT_APP_BACKEND_URL` added on Hostinger, site redeployed
- [ ] https://silkroutenaturals.com homepage shows Featured harvests (4 products)
- [ ] `/shop` loads, hard refresh on `/shop` does not 404
- [ ] Product page → Add to cart → Checkout (payment is MOCKED, no money moves)
- [ ] Admin login at `/admin` works and lists products/orders
- [ ] Browser console is clean (a single 401 from `/api/auth/me` when logged out is normal)

---

## 6. Still mocked / not live

- **Razorpay payments are MOCKED.** Orders are created and marked paid without any real
  charge. Do not advertise checkout until a real key is wired in.
- **Transactional email (SMTP) is MOCKED/no-op** until SMTP_* is filled in.
