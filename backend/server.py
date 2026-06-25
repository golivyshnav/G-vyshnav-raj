from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'change_me')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')

app = FastAPI(title="SOPHIE API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ------------------ Models ------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    is_admin: bool = False


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    images: List[str] = []
    sizes: List[str] = ["S", "M", "L", "XL"]
    colors: List[str] = ["Black", "White"]
    material: str = "Premium cotton blend"
    stock: int = 50
    rating: float = 4.7
    reviews_count: int = 0
    is_new: bool = False
    is_bestseller: bool = False
    featured: bool = False
    created_at: str = Field(default_factory=now_iso)


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    images: List[str] = []
    sizes: List[str] = ["S", "M", "L", "XL"]
    colors: List[str] = ["Black", "White"]
    material: str = "Premium cotton blend"
    stock: int = 50
    is_new: bool = False
    is_bestseller: bool = False
    featured: bool = False


class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    size: str
    color: str


class Address(BaseModel):
    full_name: str
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    postal_code: str
    country: str
    phone: str


class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: Address
    coupon_code: Optional[str] = None
    origin_url: str


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str = Field(default_factory=now_iso)


class ReviewCreate(BaseModel):
    product_id: str
    user_name: str
    rating: int
    comment: str


class Coupon(BaseModel):
    code: str
    discount_percent: float
    active: bool = True


# ------------------ Auth helpers ------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def create_token(user_id: str, email: str, is_admin: bool) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        return user
    except Exception:
        return None


async def require_user(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(401, "Authentication required")
    return user


async def require_admin(user=Depends(require_user)):
    if not user.get("is_admin"):
        raise HTTPException(403, "Admin only")
    return user


# ------------------ Auth Routes ------------------
@api_router.post("/auth/register")
async def register(payload: UserCreate):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": payload.email.lower(),
        "name": payload.name,
        "password": hash_password(payload.password),
        "is_admin": False,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_doc["id"], user_doc["email"], False)
    return {"token": token, "user": {"id": user_doc["id"], "email": user_doc["email"], "name": user_doc["name"], "is_admin": False}}


@api_router.post("/auth/login")
async def login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user["id"], user["email"], user.get("is_admin", False))
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "is_admin": user.get("is_admin", False)}}


@api_router.get("/auth/me")
async def me(user=Depends(require_user)):
    return user


# ------------------ Product Routes ------------------
@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    size: Optional[str] = None,
    color: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "featured",
    page: int = 1,
    limit: int = 12,
    search: Optional[str] = None,
):
    q: Dict[str, Any] = {}
    if category and category.lower() != "all":
        q["category"] = category
    if size:
        q["sizes"] = size
    if color:
        q["colors"] = color
    if min_price is not None or max_price is not None:
        price_q: Dict[str, Any] = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        q["price"] = price_q
    if search:
        q["name"] = {"$regex": search, "$options": "i"}

    sort_map = {
        "featured": [("featured", -1), ("created_at", -1)],
        "newest": [("created_at", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
    }
    sort_spec = sort_map.get(sort, sort_map["featured"])

    total = await db.products.count_documents(q)
    skip = (page - 1) * limit
    cursor = db.products.find(q, {"_id": 0}).sort(sort_spec).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items, "total": total, "page": page, "limit": limit, "pages": (total + limit - 1) // limit}


@api_router.get("/products/featured")
async def featured_products():
    items = await db.products.find({"featured": True}, {"_id": 0}).limit(8).to_list(8)
    return items


@api_router.get("/products/new")
async def new_arrivals():
    items = await db.products.find({"is_new": True}, {"_id": 0}).limit(8).to_list(8)
    return items


@api_router.get("/products/bestsellers")
async def bestsellers():
    items = await db.products.find({"is_bestseller": True}, {"_id": 0}).limit(8).to_list(8)
    return items


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    return p


@api_router.get("/products/{product_id}/related")
async def related_products(product_id: str):
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not p:
        return []
    items = await db.products.find(
        {"category": p["category"], "id": {"$ne": product_id}}, {"_id": 0}
    ).limit(4).to_list(4)
    return items


@api_router.post("/products", dependencies=[Depends(require_admin)])
async def create_product(payload: ProductCreate):
    p = Product(**payload.model_dump())
    await db.products.insert_one(p.model_dump())
    return p


@api_router.put("/products/{product_id}", dependencies=[Depends(require_admin)])
async def update_product(product_id: str, payload: ProductCreate):
    await db.products.update_one({"id": product_id}, {"$set": payload.model_dump()})
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    return p


@api_router.delete("/products/{product_id}", dependencies=[Depends(require_admin)])
async def delete_product(product_id: str):
    await db.products.delete_one({"id": product_id})
    return {"ok": True}


# ------------------ Categories ------------------
@api_router.get("/categories")
async def list_categories():
    cats = await db.products.distinct("category")
    return sorted(cats)


# ------------------ Reviews ------------------
@api_router.get("/reviews/{product_id}")
async def list_reviews(product_id: str):
    items = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(50)
    return items


@api_router.post("/reviews")
async def create_review(payload: ReviewCreate):
    r = Review(**payload.model_dump())
    await db.reviews.insert_one(r.model_dump())
    return r


# ------------------ Coupons ------------------
@api_router.get("/coupons/validate/{code}")
async def validate_coupon(code: str):
    c = await db.coupons.find_one({"code": code.upper(), "active": True}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Invalid coupon")
    return c


# ------------------ Newsletter ------------------
@api_router.post("/newsletter")
async def subscribe(payload: Dict[str, str]):
    email = payload.get("email", "").lower()
    if not email:
        raise HTTPException(400, "Email required")
    await db.newsletter.update_one({"email": email}, {"$set": {"email": email, "created_at": now_iso()}}, upsert=True)
    return {"ok": True}


# ------------------ Contact ------------------
@api_router.post("/contact")
async def contact(payload: Dict[str, Any]):
    payload["created_at"] = now_iso()
    payload["id"] = str(uuid.uuid4())
    await db.contact_messages.insert_one(payload)
    return {"ok": True}


# ------------------ Orders & Stripe Checkout ------------------
async def calc_order_total(items: List[CartItem], coupon_code: Optional[str] = None):
    subtotal = 0.0
    line_items = []
    for it in items:
        p = await db.products.find_one({"id": it.product_id}, {"_id": 0})
        if not p:
            raise HTTPException(400, f"Product {it.product_id} not found")
        line_total = float(p["price"]) * it.quantity
        subtotal += line_total
        line_items.append({
            "product_id": p["id"], "name": p["name"], "price": p["price"],
            "image": p["images"][0] if p.get("images") else "",
            "quantity": it.quantity, "size": it.size, "color": it.color,
        })
    shipping = 0.0 if subtotal >= 150 else 12.0
    discount = 0.0
    if coupon_code:
        c = await db.coupons.find_one({"code": coupon_code.upper(), "active": True})
        if c:
            discount = round(subtotal * (c["discount_percent"] / 100.0), 2)
    total = round(subtotal + shipping - discount, 2)
    return {"line_items": line_items, "subtotal": round(subtotal, 2), "shipping": shipping, "discount": discount, "total": total}


@api_router.post("/checkout/session")
async def create_checkout(payload: OrderCreate, request: Request, user=Depends(get_current_user)):
    totals = await calc_order_total(payload.items, payload.coupon_code)
    order_id = str(uuid.uuid4())
    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/cart"

    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    metadata = {
        "order_id": order_id,
        "user_id": user["id"] if user else "guest",
        "user_email": user["email"] if user else payload.shipping_address.full_name,
    }
    req = CheckoutSessionRequest(
        amount=float(totals["total"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(req)

    order_doc = {
        "id": order_id,
        "user_id": user["id"] if user else None,
        "user_email": user["email"] if user else "",
        "items": totals["line_items"],
        "subtotal": totals["subtotal"],
        "shipping": totals["shipping"],
        "discount": totals["discount"],
        "total": totals["total"],
        "shipping_address": payload.shipping_address.model_dump(),
        "coupon_code": payload.coupon_code,
        "status": "pending",
        "payment_status": "initiated",
        "stripe_session_id": session.session_id,
        "created_at": now_iso(),
    }
    await db.orders.insert_one(order_doc)
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "order_id": order_id,
        "session_id": session.session_id,
        "amount": float(totals["total"]),
        "currency": "usd",
        "metadata": metadata,
        "status": "initiated",
        "payment_status": "pending",
        "created_at": now_iso(),
    })
    return {"url": session.url, "session_id": session.session_id, "order_id": order_id}


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if tx and tx.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": status.status, "payment_status": status.payment_status, "updated_at": now_iso()}}
        )
        if status.payment_status == "paid":
            await db.orders.update_one(
                {"stripe_session_id": session_id},
                {"$set": {"payment_status": "paid", "status": "confirmed", "updated_at": now_iso()}}
            )

    order = await db.orders.find_one({"stripe_session_id": session_id}, {"_id": 0})
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "order": order,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None, alias="Stripe-Signature")):
    body = await request.body()
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        evt = await stripe_checkout.handle_webhook(body, stripe_signature)
        if evt.session_id:
            await db.payment_transactions.update_one(
                {"session_id": evt.session_id},
                {"$set": {"payment_status": evt.payment_status, "event_type": evt.event_type, "updated_at": now_iso()}}
            )
            if evt.payment_status == "paid":
                await db.orders.update_one(
                    {"stripe_session_id": evt.session_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed", "updated_at": now_iso()}}
                )
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
    return {"ok": True}


@api_router.get("/orders")
async def list_user_orders(user=Depends(require_user)):
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort([("created_at", -1)]).to_list(100)
    return items


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user=Depends(require_user)):
    o = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Order not found")
    if o.get("user_id") and o["user_id"] != user["id"] and not user.get("is_admin"):
        raise HTTPException(403, "Forbidden")
    return o


# ------------------ Admin ------------------
@api_router.get("/admin/stats", dependencies=[Depends(require_admin)])
async def admin_stats():
    total_orders = await db.orders.count_documents({})
    paid_orders = await db.orders.count_documents({"payment_status": "paid"})
    total_products = await db.products.count_documents({})
    total_customers = await db.users.count_documents({"is_admin": False})
    revenue_cursor = db.orders.find({"payment_status": "paid"}, {"_id": 0, "total": 1})
    revenue = 0.0
    async for d in revenue_cursor:
        revenue += float(d.get("total", 0))
    low_stock = await db.products.find({"stock": {"$lt": 10}}, {"_id": 0}).to_list(20)
    recent_orders = await db.orders.find({}, {"_id": 0}).sort([("created_at", -1)]).limit(10).to_list(10)
    return {
        "total_orders": total_orders, "paid_orders": paid_orders,
        "total_products": total_products, "total_customers": total_customers,
        "revenue": round(revenue, 2), "low_stock": low_stock, "recent_orders": recent_orders,
    }


@api_router.get("/admin/orders", dependencies=[Depends(require_admin)])
async def admin_orders():
    return await db.orders.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(500)


@api_router.get("/admin/customers", dependencies=[Depends(require_admin)])
async def admin_customers():
    return await db.users.find({}, {"_id": 0, "password": 0}).to_list(500)


@api_router.get("/admin/revenue-chart", dependencies=[Depends(require_admin)])
async def revenue_chart():
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": {"$substr": ["$created_at", 0, 10]}, "revenue": {"$sum": "$total"}, "orders": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
        {"$limit": 30},
    ]
    cursor = db.orders.aggregate(pipeline)
    return [{"date": d["_id"], "revenue": round(d["revenue"], 2), "orders": d["orders"]} async for d in cursor]


# ------------------ Seed ------------------
SEED_PRODUCTS = [
    # WOMEN
    {"name": "Silk Slip Dress", "description": "A whisper of silk, cut on the bias for fluid movement. Hand-finished hems and a subtle cowl back.", "price": 320.0, "original_price": 420.0, "category": "Women", "images": ["https://images.unsplash.com/photo-1771591742001-f689076a78a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHxoaWdoJTIwZmFzaGlvbiUyMG1vZGVsJTIwc3R1ZGlvJTIwd2hpdGUlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc4MjQxMjQ0NHww&ixlib=rb-4.1.0&q=85","https://images.pexels.com/photos/27641318/pexels-photo-27641318.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], "colors":["Black","Ivory"], "is_new": True, "is_bestseller": True, "featured": True, "material":"100% Mulberry silk"},
    {"name": "Cashmere Knit Sweater", "description": "Boxy, oversized fit in featherlight Mongolian cashmere.", "price": 480.0, "category": "Women", "images": ["https://images.unsplash.com/flagged/photo-1553802922-e345434156e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwbHV4dXJ5JTIwY2xvdGhpbmd8ZW58MHx8fHwxNzgyNDEyNDQzfDA&ixlib=rb-4.1.0&q=85","https://images.pexels.com/photos/11911863/pexels-photo-11911863.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], "colors":["Camel","Stone","Black"], "is_new": True, "featured": True, "material":"100% Cashmere"},
    {"name": "Tailored Wool Trouser", "description": "Sharp pleats. Italian wool. Engineered for movement.", "price": 290.0, "category": "Women", "images":["https://images.pexels.com/photos/27835292/pexels-photo-27835292.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/5418890/pexels-photo-5418890.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], "colors":["Black","Charcoal"], "is_bestseller": True, "material":"Italian wool"},
    {"name": "Linen Wrap Blouse", "description": "Hand-loomed Belgian linen with mother-of-pearl buttons.", "price": 240.0, "original_price": 310.0, "category": "Women", "images":["https://images.pexels.com/photos/31042862/pexels-photo-31042862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","https://images.pexels.com/photos/11911863/pexels-photo-11911863.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], "colors":["Ivory","Sand"], "is_new": True, "material":"Belgian linen"},
    # MEN
    {"name": "Pima Cotton Crewneck", "description": "Heavyweight Peruvian Pima cotton with a clean ribbed collar.", "price": 145.0, "category": "Men", "images":["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=940&q=85","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=940&q=85"], "colors":["White","Black","Olive"], "is_bestseller": True, "featured": True, "material":"Pima cotton"},
    {"name": "Merino Wool Overcoat", "description": "Single-breasted with notch lapels. Cut in Florence.", "price": 890.0, "category": "Men", "images":["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=940&q=85","https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=940&q=85"], "colors":["Charcoal","Camel"], "featured": True, "material":"100% Merino wool"},
    {"name": "Slim Twill Chino", "description": "Garment-dyed Japanese twill, finished by hand.", "price": 195.0, "original_price": 245.0, "category": "Men", "images":["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=940&q=85","https://images.unsplash.com/photo-1542272604-787c3835535d?w=940&q=85"], "colors":["Stone","Navy","Black"], "is_new": True, "material":"Japanese cotton twill"},
    {"name": "Linen Camp Shirt", "description": "Relaxed silhouette in lightweight European linen.", "price": 175.0, "category": "Men", "images":["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=940&q=85","https://images.unsplash.com/photo-1602810316693-3667c854239a?w=940&q=85"], "colors":["White","Sand","Olive"], "material":"European linen"},
    # ACCESSORIES
    {"name": "Structured Leather Tote", "description": "Vegetable-tanned Italian leather. Hand-stitched edges.", "price": 720.0, "category": "Accessories", "images":["https://images.unsplash.com/photo-1575403538007-acb790100421?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwbW9kZXJuJTIwbHV4dXJ5JTIwYmFnfGVufDB8fHx8MTc4MjQxMjQ0M3ww&ixlib=rb-4.1.0&q=85","https://images.pexels.com/photos/27835292/pexels-photo-27835292.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"], "sizes":["One Size"], "colors":["Black","Cognac","Stone"], "is_bestseller": True, "featured": True, "material":"Italian vegetable-tanned leather"},
    {"name": "Silk Twill Scarf", "description": "Hand-rolled edges. Printed in Como, Italy.", "price": 195.0, "category": "Accessories", "images":["https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=940&q=85","https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=940&q=85"], "sizes":["One Size"], "colors":["Ivory","Black","Burgundy"], "is_new": True, "material":"Italian silk twill"},
    {"name": "Leather Card Holder", "description": "Slim profile. Six card slots. Embossed monogram available.", "price": 110.0, "category": "Accessories", "images":["https://images.unsplash.com/photo-1627123424574-724758594e93?w=940&q=85","https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=940&q=85"], "sizes":["One Size"], "colors":["Black","Cognac"], "is_bestseller": True, "material":"Calfskin leather"},
    {"name": "Oversized Sun Hat", "description": "Italian wool felt with grosgrain trim.", "price": 230.0, "category": "Accessories", "images":["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=940&q=85","https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=940&q=85"], "sizes":["S","M","L"], "colors":["Black","Camel"], "is_new": True, "material":"Italian wool felt"},
    # SHOES
    {"name": "Leather Loafer", "description": "Hand-lasted in Spain. Calfskin upper, leather sole.", "price": 420.0, "category": "Shoes", "images":["https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=940&q=85","https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=940&q=85"], "sizes":["38","39","40","41","42","43"], "colors":["Black","Cognac"], "featured": True, "material":"Calfskin leather"},
    {"name": "Suede Ankle Boot", "description": "Italian suede with a stacked leather heel.", "price": 540.0, "original_price": 680.0, "category": "Shoes", "images":["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=940&q=85","https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=940&q=85"], "sizes":["36","37","38","39","40","41"], "colors":["Black","Taupe"], "is_bestseller": True, "material":"Italian suede"},
    {"name": "Minimalist Sneaker", "description": "Vegetable-tanned leather, hand-finished in Portugal.", "price": 285.0, "category": "Shoes", "images":["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=940&q=85","https://images.unsplash.com/photo-1600185365778-7cce850c6f23?w=940&q=85"], "sizes":["38","39","40","41","42","43","44"], "colors":["White","Black","Bone"], "is_new": True, "material":"Vegetable-tanned leather"},
    {"name": "Strappy Leather Sandal", "description": "Sculpted heel. Soft kidskin straps.", "price": 360.0, "category": "Shoes", "images":["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=940&q=85","https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=940&q=85"], "sizes":["36","37","38","39","40"], "colors":["Black","Ivory"], "material":"Kidskin leather"},
]


@app.on_event("startup")
async def seed_db():
    count = await db.products.count_documents({})
    if count == 0:
        for sp in SEED_PRODUCTS:
            p = Product(**sp)
            d = p.model_dump()
            await db.products.insert_one(d)
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")

    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_many([
            {"code": "WELCOME10", "discount_percent": 10.0, "active": True},
            {"code": "SOPHIE20", "discount_percent": 20.0, "active": True},
        ])

    admin_email = "admin@sophie.com"
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Admin",
            "password": hash_password("admin1234"),
            "is_admin": True,
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user admin@sophie.com / admin1234")

    test_email = "demo@sophie.com"
    if not await db.users.find_one({"email": test_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": test_email,
            "name": "Demo User",
            "password": hash_password("demo1234"),
            "is_admin": False,
            "created_at": now_iso(),
        })


@api_router.get("/")
async def root():
    return {"message": "SOPHIE API", "version": "1.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
