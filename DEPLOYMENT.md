# Silkroute Naturals — Production Deployment Guide

## Architecture
- **Frontend**: React (CRA) on Hostinger → silkroutenaturals.com
- **Backend**: FastAPI on Render → silkroute-naturals-ecommerce-website.onrender.com
- **Database**: MongoDB Atlas (M0 free tier)

---

## Render Backend — Settings

### Build settings
| Field | Value |
|---|---|
| Root Directory | `backend/` |
| Runtime | Python 3 (auto-detected from `runtime.txt`) |
| Build Command | `pip install -r requirements-prod.txt` |
| Start Command | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| Auto-Deploy | On Commit |

### Environment Variables (Render → Environment tab)
```
MONGO_URL = mongodb+srv://silkroutenaturals_db_user:A4wQDimEJY3gKEvv@cluster0.fp94e2k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME = silkroute_naturals
JWT_SECRET = b2c1f3a8d7e4956c0b8a91d2f7e3c4a5b6f8d9e0c1b2a3f4e5d6c7b8a9f0e1d2
ADMIN_EMAIL = admin@silkroutenaturals.com
ADMIN_PASSWORD = Silkroute@2026
FRONTEND_URL = https://silkroutenaturals.com
CORS_ORIGINS = https://silkroutenaturals.com,https://www.silkroutenaturals.com
```

(SMTP vars are optional — leave blank for now, emails will silently no-op.)

---

## Hostinger Frontend — Settings

### Environment Variables (Hostinger → Environment tab)
```
REACT_APP_BACKEND_URL = https://silkroute-naturals-ecommerce-website.onrender.com
```
**No trailing slash. No `/api` suffix.**

After saving, click "Settings and redeploy" so the React build picks up the new env var.

---

## MongoDB Atlas — Network Access

Make sure **Network Access** in Atlas includes `0.0.0.0/0` (allow from anywhere). Render assigns dynamic IPs, so you can't whitelist a fixed IP on the free tier.

---

## Verification (after deploy succeeds)

```bash
# 1. Hit the API root
curl https://silkroute-naturals-ecommerce-website.onrender.com/api/
# expect: {"name":"Silkroute Naturals API","status":"ok"}

# 2. Login as admin
curl -X POST https://silkroute-naturals-ecommerce-website.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@silkroutenaturals.com","password":"Silkroute@2026"}'
# expect: { "user": {...}, "access_token": "eyJ..." }

# 3. List products
curl https://silkroute-naturals-ecommerce-website.onrender.com/api/products
# expect: array of 10 seeded products
```

---

## Notes & Gotchas

1. **Render free tier spins down after 15 minutes of inactivity.** First request after a sleep takes ~50 seconds. Upgrade to $7/mo Starter to keep it warm.
2. **emergentintegrations and pandas/numpy/dev tools removed from production requirements** — they were never used in production code.
3. **Python version pinned to 3.11.10** via `runtime.txt`. Render's default is 3.14 which breaks numpy/pandas wheels.
4. **Cookies are cross-site** (Hostinger ↔ Render). The backend already sets `SameSite=None; Secure` so cookies will flow. Frontend `withCredentials: true` is also set.
