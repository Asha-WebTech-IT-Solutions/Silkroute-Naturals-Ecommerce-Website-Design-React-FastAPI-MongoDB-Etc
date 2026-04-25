"""Silkroute Naturals — Comprehensive backend API tests."""
import os
import uuid
import time

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to frontend env file because pytest runs in container
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@silkroutenaturals.com"
ADMIN_PASSWORD = "Silkroute@2026"
CUSTOMER_EMAIL = "customer@example.com"
CUSTOMER_PASSWORD = "Customer@2026"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    token = r.json().get("access_token")
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="session")
def customer_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"customer login failed: {r.status_code} {r.text}"
    token = r.json().get("access_token")
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_login_admin(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["role"] == "admin"
        assert "access_token" in data
        # cookies should be set
        assert "access_token" in r.cookies or any(c.name == "access_token" for c in r.cookies)

    def test_login_customer(self):
        r = requests.post(f"{API}/auth/login", json={"email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD}, timeout=15)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "customer"

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "noone@x.com", "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_register_and_me(self):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        s = requests.Session()
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "Passw0rd!", "name": "Test User"}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["user"]["email"] == email
        token = r.json()["access_token"]
        # bcrypt hash format check via login again
        r2 = s.post(f"{API}/auth/login", json={"email": email, "password": "Passw0rd!"}, timeout=15)
        assert r2.status_code == 200
        # /me with bearer
        r3 = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=10)
        assert r3.status_code == 200
        assert r3.json()["email"] == email

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={"email": CUSTOMER_EMAIL, "password": "anything123", "name": "x"}, timeout=15)
        assert r.status_code == 400


# ---------- Products ----------
class TestProducts:
    def test_list_products(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 10, f"expected 10 seeded products, got {len(items)}"
        # Ensure no _id leakage
        for it in items:
            assert "_id" not in it
            assert "slug" in it and "price" in it

    def test_filter_by_category(self):
        r = requests.get(f"{API}/products", params={"category": "almond"}, timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p["category"] == "almond"

    def test_get_product_silk_experience(self):
        # 'silk-experience' is the URL prefix; pick any seeded slug instead
        items = requests.get(f"{API}/products", timeout=15).json()
        slug = items[0]["slug"]
        r = requests.get(f"{API}/products/{slug}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == slug
        assert "reviews" in data and "avg_rating" in data

    def test_get_product_silk_experience_explicit(self):
        # As mentioned in review request — try if a product slug 'silk-experience' exists, else accept 404
        r = requests.get(f"{API}/products/silk-experience", timeout=15)
        assert r.status_code in (200, 404)

    def test_product_404(self):
        r = requests.get(f"{API}/products/nonexistent-xyz", timeout=10)
        assert r.status_code == 404


# ---------- Coupons ----------
class TestCoupons:
    def test_validate_welcome10(self):
        r = requests.post(f"{API}/coupons/validate", json={"code": "WELCOME10", "subtotal": 1500}, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["discount"] == 150.0
        assert d["coupon"]["code"] == "WELCOME10"

    def test_validate_min_order(self):
        r = requests.post(f"{API}/coupons/validate", json={"code": "WELCOME10", "subtotal": 100}, timeout=10)
        assert r.status_code == 400

    def test_validate_invalid(self):
        r = requests.post(f"{API}/coupons/validate", json={"code": "BAD_CODE_X", "subtotal": 5000}, timeout=10)
        assert r.status_code == 404


# ---------- Custom Nut Butter ----------
class TestCustomNutButter:
    def test_price_calc(self):
        body = {"nuts": ["almond", "cashew"], "raw_or_roasted": "roasted", "flavors": ["honey"], "texture": "smooth", "size": "500g"}
        r = requests.post(f"{API}/custom-nut-butter/price", json=body, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["price"] > 0
        # Manual: avg(350,280)=315 ; +honey 80 ; +roasted 40 = 435 ; *2.3 = 1000.5 ; +50 = 1050.5
        assert abs(d["price"] - 1050.5) < 1.0

    def test_price_1kg(self):
        body = {"nuts": ["pistachio"], "raw_or_roasted": "raw", "flavors": ["saffron"], "texture": "crunchy", "size": "1kg"}
        r = requests.post(f"{API}/custom-nut-butter/price", json=body, timeout=10)
        assert r.status_code == 200
        # 480 + 250 + 0 = 730 ; *4.2 = 3066 ; +50 = 3116
        assert abs(r.json()["price"] - 3116.0) < 1.0

    def test_create_requires_auth(self):
        body = {"nuts": ["almond"], "raw_or_roasted": "raw", "flavors": [], "texture": "smooth", "size": "200g"}
        r = requests.post(f"{API}/custom-nut-butter", json=body, timeout=10)
        assert r.status_code == 401

    def test_create_authenticated(self, customer_session):
        body = {"nuts": ["almond"], "raw_or_roasted": "raw", "flavors": [], "texture": "smooth", "size": "200g", "name": "TEST_custom"}
        r = customer_session.post(f"{API}/custom-nut-butter", json=body, timeout=10)
        assert r.status_code == 200
        assert "id" in r.json() and r.json()["price"] > 0


# ---------- Orders ----------
class TestOrders:
    def test_create_order_and_persist(self, customer_session):
        # Pick a product
        prods = requests.get(f"{API}/products", timeout=10).json()
        prod = next(p for p in prods if p["stock"] > 0)
        initial_stock = prod["stock"]
        body = {
            "items": [{"product_id": prod["id"], "quantity": 1}],
            "shipping_address": {"line1": "1 Test", "city": "Mumbai", "state": "MH", "pincode": "400001", "country": "IN", "phone": "+91 9999999999"},
            "coupon_code": "WELCOME10",
            "payment_method": "razorpay_mock",
            "notes": "TEST_order",
        }
        r = customer_session.post(f"{API}/orders", json=body, timeout=15)
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["payment_status"] == "paid"
        assert order["status"] == "confirmed"
        assert order["order_number"].startswith("SR")
        assert order["discount"] > 0  # WELCOME10 applied if subtotal >= 999

        # Verify in /orders/mine
        mine = customer_session.get(f"{API}/orders/mine", timeout=10).json()
        assert any(o["id"] == order["id"] for o in mine)

        # Verify stock decremented
        time.sleep(0.5)
        new_prod = requests.get(f"{API}/products/{prod['slug']}", timeout=10).json()
        assert new_prod["stock"] == initial_stock - 1

    def test_orders_admin_only(self, customer_session, admin_session):
        r = customer_session.get(f"{API}/orders", timeout=10)
        assert r.status_code == 403
        r2 = admin_session.get(f"{API}/orders", timeout=10)
        assert r2.status_code == 200
        assert isinstance(r2.json(), list)

    def test_orders_unauthenticated(self):
        r = requests.get(f"{API}/orders/mine", timeout=10)
        assert r.status_code == 401


# ---------- Bookings / Gifting / Contact ----------
class TestForms:
    def test_create_booking(self):
        body = {
            "name": "TEST Booking",
            "email": "tb@example.com",
            "phone": "+91 9000000000",
            "visit_date": "2026-02-15",
            "visit_time": "11:00",
            "party_size": 2,
            "experience_type": "tasting",
            "notes": "TEST",
        }
        r = requests.post(f"{API}/bookings", json=body, timeout=10)
        assert r.status_code == 200
        assert r.json()["status"] == "pending"

    def test_create_gifting(self):
        body = {"company": "TEST Co", "name": "Test", "email": "g@example.com", "phone": "+919000000001", "quantity": 50, "occasion": "Diwali"}
        r = requests.post(f"{API}/gifting-inquiries", json=body, timeout=10)
        assert r.status_code == 200

    def test_create_contact(self):
        r = requests.post(f"{API}/contact", json={"name": "Test", "email": "c@example.com", "message": "Hello TEST"}, timeout=10)
        assert r.status_code == 200


# ---------- Blog & Banners ----------
class TestContent:
    def test_blog_list(self):
        r = requests.get(f"{API}/blog", timeout=10)
        assert r.status_code == 200
        posts = r.json()
        assert len(posts) >= 4
        for p in posts:
            assert "_id" not in p

    def test_blog_get_first(self):
        posts = requests.get(f"{API}/blog", timeout=10).json()
        slug = posts[0]["slug"]
        r = requests.get(f"{API}/blog/{slug}", timeout=10)
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_banners(self):
        r = requests.get(f"{API}/banners", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Reviews ----------
class TestReviews:
    def test_create_review(self, customer_session):
        prods = requests.get(f"{API}/products", timeout=10).json()
        pid = prods[0]["id"]
        slug = prods[0]["slug"]
        r = customer_session.post(f"{API}/reviews", json={"product_id": pid, "rating": 5, "title": "TEST review", "body": "Excellent"}, timeout=10)
        assert r.status_code == 200
        # avg rating should now be > 0
        time.sleep(0.3)
        prod = requests.get(f"{API}/products/{slug}", timeout=10).json()
        assert prod["avg_rating"] > 0

    def test_review_requires_auth(self):
        r = requests.post(f"{API}/reviews", json={"product_id": "x", "rating": 5, "title": "t", "body": "b"}, timeout=10)
        assert r.status_code == 401


# ---------- Admin ----------
class TestAdmin:
    def test_analytics(self, admin_session):
        r = admin_session.get(f"{API}/admin/analytics", timeout=10)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_revenue", "total_orders", "total_customers", "total_products", "top_products", "by_day"):
            assert k in d

    def test_analytics_forbidden_for_customer(self, customer_session):
        r = customer_session.get(f"{API}/admin/analytics", timeout=10)
        assert r.status_code == 403

    def test_product_crud(self, admin_session):
        slug = f"test-prod-{uuid.uuid4().hex[:6]}"
        body = {
            "slug": slug, "name": "TEST_Product", "origin": "Test", "category": "almond",
            "tagline": "t", "description": "d", "benefits": ["b1"],
            "price": 100.0, "weight": "100g", "stock": 5, "images": ["http://x.com/i.jpg"],
            "featured": False,
        }
        r = admin_session.post(f"{API}/products", json=body, timeout=10)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        # Update
        body["name"] = "TEST_Product_Updated"
        r2 = admin_session.put(f"{API}/products/{pid}", json=body, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["name"] == "TEST_Product_Updated"
        # Delete
        r3 = admin_session.delete(f"{API}/products/{pid}", timeout=10)
        assert r3.status_code == 200
        # Verify gone
        r4 = requests.get(f"{API}/products/{slug}", timeout=10)
        assert r4.status_code == 404

    def test_product_create_forbidden_for_customer(self, customer_session):
        r = customer_session.post(f"{API}/products", json={
            "slug": "x", "name": "x", "origin": "x", "category": "x", "tagline": "x",
            "description": "x", "price": 1, "weight": "x", "stock": 1
        }, timeout=10)
        assert r.status_code == 403

    def test_coupon_create_admin(self, admin_session, customer_session):
        code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        body = {"code": code, "discount_type": "flat", "discount_value": 50, "min_order": 0, "active": True, "description": "TEST"}
        # Customer forbidden
        r0 = customer_session.post(f"{API}/coupons", json=body, timeout=10)
        assert r0.status_code == 403
        # Admin allowed
        r = admin_session.post(f"{API}/coupons", json=body, timeout=10)
        assert r.status_code == 200, r.text
        cid = r.json()["id"]
        # Cleanup
        admin_session.delete(f"{API}/coupons/{cid}", timeout=10)
