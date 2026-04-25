import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", pincode: "", country: "India" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) { /* prefill phone? */ } }, [user]);

  if (!ready) return <div className="container-luxe py-32">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (items.length === 0) return (
    <div className="container-luxe py-32 text-center">
      <div className="font-serif text-3xl">Your cart is empty.</div>
      <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Shop</Link>
    </div>
  );

  const shipping = subtotal >= 1499 ? 0 : 79;
  const total = Math.max(0, subtotal - discount + shipping);

  const apply = async () => {
    if (!coupon) return;
    try {
      const { data } = await api.post("/coupons/validate", { code: coupon, subtotal });
      setAppliedCoupon(data.coupon);
      setDiscount(data.discount);
      toast.success(`Coupon applied — ₹${data.discount} off`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Invalid coupon");
    }
  };

  const placeOrder = async () => {
    if (!address.line1 || !address.city || !address.pincode) { toast.error("Please complete shipping address"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items, shipping_address: address, coupon_code: appliedCoupon?.code, payment_method: "razorpay_mock",
      });
      clear();
      toast.success(`Order placed — ${data.order_number}`);
      nav("/account");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Order failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="section-pad container-luxe grid md:grid-cols-12 gap-12" data-testid="checkout-page">
      <div className="md:col-span-7 space-y-8">
        <div>
          <div className="overline mb-3">Step 1</div>
          <h2 className="font-serif text-3xl">Shipping address</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
            <input required className="luxe-input col-span-2" placeholder="Address Line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} data-testid="checkout-line1" />
            <input className="luxe-input col-span-2" placeholder="Address Line 2 (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
            <input required className="luxe-input col-span-1" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} data-testid="checkout-city" />
            <input required className="luxe-input col-span-1" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} data-testid="checkout-state" />
            <input required className="luxe-input col-span-1" placeholder="PIN Code" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} data-testid="checkout-pincode" />
            <input className="luxe-input col-span-1" placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="overline mb-3">Step 2</div>
          <h2 className="font-serif text-3xl">Payment</h2>
          <div className="mt-4 p-5 border flex items-center gap-3" style={{ borderColor: "hsl(var(--line))" }}>
            <input type="radio" defaultChecked /> <span>Razorpay (test mode — payment is mocked)</span>
          </div>
          <p className="text-xs text-foreground/60 mt-2">Live payment will be enabled once Razorpay credentials are added.</p>
        </div>
      </div>

      {/* Summary */}
      <aside className="md:col-span-5 self-start md:sticky md:top-32 p-8" style={{ background: "hsl(var(--background-2))" }}>
        <div className="overline mb-2">Order summary</div>
        <h3 className="font-serif text-3xl">Your selection</h3>
        <div className="mt-6 space-y-4">
          {items.map((i, k) => (
            <div key={k} className="flex gap-3 text-sm">
              <div className="w-14 h-16 bg-ivory shrink-0">{i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}</div>
              <div className="flex-1">
                <div className="font-serif">{i.name}</div>
                <div className="text-xs text-foreground/60">× {i.quantity}</div>
              </div>
              <div>{formatINR(i.price * i.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <input className="luxe-input flex-1" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} data-testid="checkout-coupon-input" />
          <button onClick={apply} className="btn-ghost py-3 px-4" data-testid="checkout-coupon-apply">Apply</button>
        </div>

        <div className="mt-6 space-y-2 text-sm border-t pt-5" style={{ borderColor: "hsl(var(--line))" }}>
          <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between" style={{ color: "hsl(var(--gold))" }}><span>Discount ({appliedCoupon?.code})</span><span>− {formatINR(discount)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
          <div className="flex justify-between font-serif text-2xl pt-3"><span>Total</span><span data-testid="checkout-total">{formatINR(total)}</span></div>
        </div>
        <button onClick={placeOrder} disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50" data-testid="checkout-place-order">{loading ? "Placing..." : "Place Order"}</button>
      </aside>
    </div>
  );
}
