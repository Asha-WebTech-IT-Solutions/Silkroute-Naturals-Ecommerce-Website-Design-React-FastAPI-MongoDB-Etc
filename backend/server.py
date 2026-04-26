"""Silkroute Naturals — FastAPI backend."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.encoders import jsonable_encoder
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

from auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, extract_token, get_current_user, get_admin_user, get_optional_user,
)
from seed_data import PRODUCTS, COUPONS, BLOG_POSTS, BANNERS
import mailer

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("silkroute")

# ---------- DB ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ---------- App ----------
app = FastAPI(title="Silkroute Naturals API", version="1.0.0")
api = APIRouter(prefix="/api")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ============================================================
#                          MODELS
# ============================================================

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    phone: Optional[str] = ""


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProductIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    slug: str
    name: str
    origin: str
    category: str
    tagline: str
    description: str
    benefits: List[str] = []
    price: float
    compare_at_price: Optional[float] = None
    weight: str
    stock: int
    images: List[str] = []
    featured: bool = False
    story: Optional[str] = ""


class ReviewIn(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    title: str
    body: str


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)
    custom: Optional[dict] = None
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None


class CheckoutIn(BaseModel):
    items: List[CartItem]
    shipping_address: dict
    coupon_code: Optional[str] = None
    payment_method: str = "razorpay_mock"
    notes: Optional[str] = ""
    guest: Optional[dict] = None  # { email, name, phone } for guest checkout


class CouponIn(BaseModel):
    code: str
    discount_type: str  # 'percent' | 'flat'
    discount_value: float
    min_order: float = 0
    active: bool = True
    description: Optional[str] = ""


class BookingIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    visit_date: str
    visit_time: str
    party_size: int = 2
    experience_type: str  # 'tasting' | 'tour' | 'workshop'
    notes: Optional[str] = ""


class GiftingIn(BaseModel):
    company: str
    name: str
    email: EmailStr
    phone: str
    quantity: int
    budget: Optional[float] = None
    occasion: Optional[str] = ""
    message: Optional[str] = ""


class CustomNutButterIn(BaseModel):
    nuts: List[str]
    raw_or_roasted: str  # 'raw' | 'roasted'
    roast_level: Optional[str] = None  # 'light' | 'medium' | 'dark'
    flavors: List[str] = []
    texture: str  # 'smooth' | 'crunchy'
    size: str  # '200g' | '500g' | '1kg'
    name: Optional[str] = ""


class BlogIn(BaseModel):
    slug: str
    title: str
    excerpt: str
    cover_image: str
    content: str
    author: str = "Silkroute Editorial"


class BannerIn(BaseModel):
    title: str
    subtitle: str
    cta_label: str
    cta_link: str
    image: str
    active: bool = True


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    password: str = Field(min_length=6)


# ============================================================
#                     STARTUP / SEEDING
# ============================================================

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.coupons.create_index("code", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.orders.create_index("user_id")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@silkroutenaturals.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Silkroute@2026")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": new_id(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Silkroute Admin",
            "phone": "",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed test customer
    test_email = "customer@example.com"
    if not await db.users.find_one({"email": test_email}):
        await db.users.insert_one({
            "id": new_id(),
            "email": test_email,
            "password_hash": hash_password("Customer@2026"),
            "name": "Aanya Mehta",
            "phone": "+91 9876543210",
            "role": "customer",
            "created_at": now_iso(),
        })

    # Seed products
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([dict(p) for p in PRODUCTS])
        logger.info("Seeded %d products", len(PRODUCTS))

    # Seed coupons
    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_many([dict(c) for c in COUPONS])

    # Seed blog
    if await db.blog_posts.count_documents({}) == 0:
        await db.blog_posts.insert_many([dict(b) for b in BLOG_POSTS])

    # Seed banners
    if await db.banners.count_documents({}) == 0:
        await db.banners.insert_many([dict(b) for b in BANNERS])


@app.on_event("shutdown")
async def shutdown():
    client.close()


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=7 * 24 * 3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=30 * 24 * 3600, path="/")


def public_user(u: dict) -> dict:
    u = {k: v for k, v in u.items() if k not in ("_id", "password_hash")}
    return u


# ============================================================
#                          AUTH
# ============================================================

@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": new_id(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "phone": payload.phone or "",
        "role": "customer",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    access = create_access_token(user["id"], email, "customer")
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    try:
        mailer.send_welcome(email, payload.name)
    except Exception as e:
        logger.warning("welcome email failed: %s", e)
    return {"user": public_user(user), "access_token": access}


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["id"], email, user.get("role", "customer"))
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"user": public_user(user), "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


@api.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordIn):
    import secrets
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.password_reset_tokens.insert_one({
            "id": new_id(),
            "token": token,
            "user_id": user["id"],
            "email": email,
            "expires_at": expires_at,
            "used": False,
            "created_at": now_iso(),
        })
        frontend = os.environ.get("FRONTEND_URL", "https://silkroutenaturals.com")
        link = f"{frontend}/reset-password?token={token}"
        logger.info("[forgot-password] reset link for %s: %s", email, link)
        try:
            mailer.send_password_reset(email, link)
        except Exception as e:
            logger.warning("password reset email failed: %s", e)
    return {"ok": True, "message": "If an account exists, a reset link has been sent."}


@api.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordIn):
    rec = await db.password_reset_tokens.find_one({"token": payload.token, "used": False})
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    expires_at = rec.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset link has expired")
    await db.users.update_one({"id": rec["user_id"]}, {"$set": {"password_hash": hash_password(payload.password)}})
    await db.password_reset_tokens.update_one({"_id": rec["_id"]}, {"$set": {"used": True}})
    return {"ok": True}



# ============================================================
#                        PRODUCTS
# ============================================================

@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    origin: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
):
    q: dict = {}
    if category:
        q["category"] = category
    if origin:
        q["origin"] = origin
    if featured is not None:
        q["featured"] = featured
    if min_price is not None or max_price is not None:
        q["price"] = {}
        if min_price is not None:
            q["price"]["$gte"] = min_price
        if max_price is not None:
            q["price"]["$lte"] = max_price
    if search:
        q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"origin": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]
    items = await db.products.find(q, {"_id": 0}).to_list(500)
    return items


@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    reviews = await db.reviews.find({"product_id": p["id"]}, {"_id": 0}).to_list(100)
    p["reviews"] = reviews
    p["avg_rating"] = round(sum(r["rating"] for r in reviews) / len(reviews), 1) if reviews else 0
    return p


@api.post("/products", dependencies=[Depends(get_admin_user)])
async def create_product(payload: ProductIn):
    p = payload.model_dump()
    p["id"] = new_id()
    p["created_at"] = now_iso()
    await db.products.insert_one(p)
    p.pop("_id", None)
    return p


@api.put("/products/{product_id}", dependencies=[Depends(get_admin_user)])
async def update_product(product_id: str, payload: ProductIn):
    upd = payload.model_dump()
    res = await db.products.update_one({"id": product_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.products.find_one({"id": product_id}, {"_id": 0})


@api.delete("/products/{product_id}", dependencies=[Depends(get_admin_user)])
async def delete_product(product_id: str):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# ============================================================
#                         REVIEWS
# ============================================================

@api.post("/reviews")
async def create_review(payload: ReviewIn, user=Depends(get_current_user)):
    review = {
        "id": new_id(),
        "product_id": payload.product_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "rating": payload.rating,
        "title": payload.title,
        "body": payload.body,
        "created_at": now_iso(),
    }
    await db.reviews.insert_one(review)
    review.pop("_id", None)
    return review


# ============================================================
#                         COUPONS
# ============================================================

@api.get("/coupons")
async def list_coupons(_=Depends(get_admin_user)):
    return await db.coupons.find({}, {"_id": 0}).to_list(200)


@api.post("/coupons", dependencies=[Depends(get_admin_user)])
async def create_coupon(payload: CouponIn):
    c = payload.model_dump()
    c["code"] = c["code"].upper()
    if await db.coupons.find_one({"code": c["code"]}):
        raise HTTPException(status_code=400, detail="Code exists")
    c["id"] = new_id()
    c["created_at"] = now_iso()
    await db.coupons.insert_one(c)
    c.pop("_id", None)
    return c


@api.delete("/coupons/{coupon_id}", dependencies=[Depends(get_admin_user)])
async def delete_coupon(coupon_id: str):
    await db.coupons.delete_one({"id": coupon_id})
    return {"ok": True}


@api.post("/coupons/validate")
async def validate_coupon(body: dict):
    code = (body.get("code") or "").upper()
    subtotal = float(body.get("subtotal") or 0)
    c = await db.coupons.find_one({"code": code, "active": True}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Invalid coupon")
    if subtotal < c["min_order"]:
        raise HTTPException(status_code=400, detail=f"Minimum order ₹{c['min_order']:.0f} required")
    if c["discount_type"] == "percent":
        discount = round(subtotal * c["discount_value"] / 100, 2)
    else:
        discount = float(c["discount_value"])
    return {"coupon": c, "discount": discount}


# ============================================================
#                          ORDERS
# ============================================================

async def _calculate_order(items: List[CartItem], coupon_code: Optional[str]):
    subtotal = 0.0
    enriched = []
    for it in items:
        if it.custom and it.price is not None:
            line_price = float(it.price)
            name = it.name or "Custom Nut Butter"
            image = it.image or ""
        else:
            p = await db.products.find_one({"id": it.product_id}, {"_id": 0})
            if not p:
                raise HTTPException(status_code=400, detail=f"Product {it.product_id} not found")
            line_price = float(p["price"])
            name = p["name"]
            image = (p.get("images") or [""])[0]
        line_total = line_price * it.quantity
        subtotal += line_total
        enriched.append({
            "product_id": it.product_id,
            "quantity": it.quantity,
            "price": line_price,
            "name": name,
            "image": image,
            "custom": it.custom,
            "line_total": line_total,
        })
    discount = 0.0
    coupon = None
    if coupon_code:
        c = await db.coupons.find_one({"code": coupon_code.upper(), "active": True}, {"_id": 0})
        if c and subtotal >= c["min_order"]:
            coupon = c
            if c["discount_type"] == "percent":
                discount = round(subtotal * c["discount_value"] / 100, 2)
            else:
                discount = float(c["discount_value"])
    shipping = 0 if subtotal >= 1499 else 79
    total = max(0.0, round(subtotal - discount + shipping, 2))
    return {"subtotal": round(subtotal, 2), "discount": round(discount, 2), "shipping": shipping, "total": total, "items": enriched, "coupon": coupon}


@api.post("/checkout/calculate")
async def calculate(payload: CheckoutIn, user=Depends(get_optional_user)):
    summary = await _calculate_order(payload.items, payload.coupon_code)
    return summary


@api.post("/orders")
async def create_order(payload: CheckoutIn, user=Depends(get_optional_user)):
    summary = await _calculate_order(payload.items, payload.coupon_code)
    is_guest = user is None
    if is_guest:
        guest = (payload.guest or {})
        guest_email = (guest.get("email") or "").strip().lower()
        guest_name = (guest.get("name") or "").strip()
        guest_phone = (guest.get("phone") or "").strip()
        if not guest_email or not guest_name:
            raise HTTPException(status_code=400, detail="Guest checkout requires email and name")
        order_user_id = "guest_" + new_id()[:12]
        order_user_email = guest_email
        order_user_name = guest_name
        order_phone = guest_phone
    else:
        order_user_id = user["id"]
        order_user_email = user["email"]
        order_user_name = user["name"]
        order_phone = user.get("phone", "")
    order = {
        "id": new_id(),
        "order_number": "SR" + datetime.now(timezone.utc).strftime("%y%m%d") + str(uuid.uuid4().int)[:6],
        "user_id": order_user_id,
        "user_email": order_user_email,
        "user_name": order_user_name,
        "phone": order_phone,
        "is_guest": is_guest,
        "items": summary["items"],
        "subtotal": summary["subtotal"],
        "discount": summary["discount"],
        "shipping": summary["shipping"],
        "total": summary["total"],
        "coupon_code": payload.coupon_code,
        "shipping_address": payload.shipping_address,
        "payment_method": payload.payment_method,
        "payment_status": "paid",
        "status": "confirmed",
        "notes": payload.notes,
        "created_at": now_iso(),
    }
    await db.orders.insert_one(order)
    order.pop("_id", None)
    for it in summary["items"]:
        if it.get("product_id") and not it.get("custom"):
            await db.products.update_one({"id": it["product_id"]}, {"$inc": {"stock": -it["quantity"]}})
    try:
        mailer.send_order_confirmation(order_user_email, order_user_name, order)
    except Exception as e:
        logger.warning("order email failed: %s", e)
    return order


@api.get("/orders/mine")
async def my_orders(user=Depends(get_current_user)):
    return await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.get("/orders")
async def all_orders(_=Depends(get_admin_user)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.put("/orders/{order_id}/status", dependencies=[Depends(get_admin_user)])
async def update_order_status(order_id: str, body: dict):
    status = body.get("status")
    if status not in ("confirmed", "shipped", "delivered", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if order:
        try:
            mailer.send_order_status(order["user_email"], order["user_name"], order["order_number"], status)
        except Exception as e:
            logger.warning("status email failed: %s", e)
    return {"ok": True}


# ============================================================
#                       BOOKINGS
# ============================================================

@api.post("/bookings")
async def create_booking(payload: BookingIn):
    b = payload.model_dump()
    b["id"] = new_id()
    b["status"] = "pending"
    b["created_at"] = now_iso()
    await db.bookings.insert_one(b)
    b.pop("_id", None)
    try:
        mailer.send_booking_received(b["email"], b["name"], b)
    except Exception as e:
        logger.warning("booking email failed: %s", e)
    return b


@api.get("/bookings")
async def list_bookings(_=Depends(get_admin_user)):
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.put("/bookings/{booking_id}/status", dependencies=[Depends(get_admin_user)])
async def update_booking_status(booking_id: str, body: dict):
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": body.get("status", "confirmed")}})
    return {"ok": True}


# ============================================================
#                  GIFTING & CUSTOM ORDERS
# ============================================================

@api.post("/gifting-inquiries")
async def create_gifting(payload: GiftingIn):
    g = payload.model_dump()
    g["id"] = new_id()
    g["status"] = "new"
    g["created_at"] = now_iso()
    await db.gifting.insert_one(g)
    g.pop("_id", None)
    return g


@api.get("/gifting-inquiries")
async def list_gifting(_=Depends(get_admin_user)):
    return await db.gifting.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# Pricing logic for custom nut butter
NUT_PRICES = {"almond": 350, "cashew": 280, "pistachio": 480, "hazelnut": 320}
FLAVOR_PRICES = {"honey": 80, "chocolate": 120, "dates": 100, "cinnamon": 50, "saffron": 250}
SIZE_MULTIPLIERS = {"200g": 1.0, "500g": 2.3, "1kg": 4.2}
ROAST_PREMIUM = {"raw": 0, "roasted": 40}


@api.post("/custom-nut-butter/price")
async def price_custom(payload: CustomNutButterIn):
    base = sum(NUT_PRICES.get(n, 0) for n in payload.nuts) / max(1, len(payload.nuts))
    flavor_total = sum(FLAVOR_PRICES.get(f, 0) for f in payload.flavors)
    roast = ROAST_PREMIUM.get(payload.raw_or_roasted, 0)
    base_total = (base + flavor_total + roast) * SIZE_MULTIPLIERS.get(payload.size, 1.0)
    price = round(base_total + 50, 2)  # +50 artisan fee
    return {"price": price, "details": {"base": round(base, 2), "flavors": flavor_total, "roast": roast, "size_multiplier": SIZE_MULTIPLIERS.get(payload.size, 1.0)}}


@api.post("/custom-nut-butter")
async def create_custom(payload: CustomNutButterIn, user=Depends(get_current_user)):
    pricing = await price_custom(payload)
    c = payload.model_dump()
    c["id"] = new_id()
    c["user_id"] = user["id"]
    c["price"] = pricing["price"]
    c["status"] = "received"
    c["created_at"] = now_iso()
    await db.custom_orders.insert_one(c)
    c.pop("_id", None)
    return c


@api.get("/custom-nut-butter")
async def list_custom(_=Depends(get_admin_user)):
    return await db.custom_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ============================================================
#                          BLOG
# ============================================================

@api.get("/blog")
async def list_blog():
    return await db.blog_posts.find({}, {"_id": 0}).sort("published_at", -1).to_list(200)


@api.get("/blog/{slug}")
async def get_post(slug: str):
    p = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    return p


@api.post("/blog", dependencies=[Depends(get_admin_user)])
async def create_post(payload: BlogIn):
    b = payload.model_dump()
    b["id"] = new_id()
    b["published_at"] = now_iso()
    await db.blog_posts.insert_one(b)
    b.pop("_id", None)
    return b


@api.delete("/blog/{post_id}", dependencies=[Depends(get_admin_user)])
async def delete_post(post_id: str):
    await db.blog_posts.delete_one({"id": post_id})
    return {"ok": True}


# ============================================================
#                         BANNERS
# ============================================================

@api.get("/banners")
async def list_banners():
    return await db.banners.find({"active": True}, {"_id": 0}).to_list(20)


@api.get("/banners/all")
async def list_all_banners(_=Depends(get_admin_user)):
    return await db.banners.find({}, {"_id": 0}).to_list(50)


@api.post("/banners", dependencies=[Depends(get_admin_user)])
async def create_banner(payload: BannerIn):
    b = payload.model_dump()
    b["id"] = new_id()
    b["created_at"] = now_iso()
    await db.banners.insert_one(b)
    b.pop("_id", None)
    return b


@api.delete("/banners/{banner_id}", dependencies=[Depends(get_admin_user)])
async def delete_banner(banner_id: str):
    await db.banners.delete_one({"id": banner_id})
    return {"ok": True}


# ============================================================
#                         CONTACT
# ============================================================

@api.post("/contact")
async def create_contact(payload: ContactIn):
    c = payload.model_dump()
    c["id"] = new_id()
    c["created_at"] = now_iso()
    await db.contact_messages.insert_one(c)
    c.pop("_id", None)
    return c


@api.get("/contact")
async def list_contact(_=Depends(get_admin_user)):
    return await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ============================================================
#                        CUSTOMERS
# ============================================================

@api.get("/customers")
async def list_customers(_=Depends(get_admin_user)):
    return await db.users.find({"role": "customer"}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)


# ============================================================
#                       ANALYTICS
# ============================================================

@api.get("/admin/analytics")
async def analytics(_=Depends(get_admin_user)):
    total_orders = await db.orders.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})
    total_products = await db.products.count_documents({})
    pipeline = [{"$group": {"_id": None, "revenue": {"$sum": "$total"}}}]
    rev_cur = db.orders.aggregate(pipeline)
    rev = 0
    async for r in rev_cur:
        rev = r.get("revenue", 0)
    # Top products by quantity
    top_pipeline = [
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.name", "qty": {"$sum": "$items.quantity"}, "revenue": {"$sum": "$items.line_total"}}},
        {"$sort": {"qty": -1}},
        {"$limit": 5},
    ]
    top = []
    async for t in db.orders.aggregate(top_pipeline):
        top.append({"name": t["_id"], "qty": t["qty"], "revenue": t["revenue"]})
    # Orders by day (last 14)
    by_day_pipeline = [
        {"$group": {"_id": {"$substr": ["$created_at", 0, 10]}, "orders": {"$sum": 1}, "revenue": {"$sum": "$total"}}},
        {"$sort": {"_id": -1}},
        {"$limit": 14},
    ]
    by_day = []
    async for d in db.orders.aggregate(by_day_pipeline):
        by_day.append({"date": d["_id"], "orders": d["orders"], "revenue": d["revenue"]})
    by_day.reverse()
    return {
        "total_revenue": round(rev, 2),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_products": total_products,
        "top_products": top,
        "by_day": by_day,
    }


# ============================================================

@api.get("/")
async def root():
    return {"name": "Silkroute Naturals API", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
)
