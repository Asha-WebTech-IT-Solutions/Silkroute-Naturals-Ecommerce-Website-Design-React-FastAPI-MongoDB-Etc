import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useSEO } from "@/lib/seo";
import { ChevronLeft, Package, MapPin, CreditCard } from "lucide-react";

const STATUS_TIMELINE = ["confirmed", "shipped", "delivered"];

export default function OrderDetail() {
  useSEO({ title: "Order details" });
  const { number } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/orders/${number}`)
      .then((r) => setOrder(r.data))
      .catch((e) => setError(e.response?.data?.detail || "Order not found"));
  }, [number]);

  if (error) return (
    <div className="container-luxe py-32 text-center">
      <div className="font-serif text-3xl">{error}</div>
      <Link to="/account" className="btn-ghost mt-6 inline-flex">Back to Account</Link>
    </div>
  );
  if (!order) return <div className="container-luxe py-32 text-foreground/60">Loading...</div>;

  const cur = STATUS_TIMELINE.indexOf(order.status);

  return (
    <div className="section-pad container-luxe max-w-5xl" data-testid="order-detail-page">
      <Link to="/account" className="text-xs uppercase tracking-widest hover-underline inline-flex items-center gap-1 mb-8">
        <ChevronLeft size={14} /> Back to orders
      </Link>

      <div className="flex flex-wrap justify-between items-end gap-6">
        <div>
          <div className="overline">Order</div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mt-2" data-testid="order-detail-number">#{order.order_number}</h1>
          <p className="text-foreground/60 mt-3 text-sm">Placed {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</p>
        </div>
        <div className="text-right">
          <div className="overline" style={{ color: "hsl(var(--gold))" }}>{order.status}</div>
          <div className="font-serif text-4xl mt-2">{formatINR(order.total)}</div>
        </div>
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" && (
        <div className="mt-12 p-8" style={{ background: "hsl(var(--background-2))" }}>
          <div className="overline mb-6">Shipment timeline</div>
          <div className="flex items-center justify-between gap-4">
            {STATUS_TIMELINE.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center text-center relative">
                {i > 0 && (
                  <div className="absolute top-3 right-1/2 w-full h-px" style={{ background: i <= cur ? "hsl(var(--gold))" : "hsl(var(--line-strong))" }} />
                )}
                <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: i <= cur ? "hsl(var(--gold))" : "hsl(var(--background-2))", border: i <= cur ? "none" : "1px solid hsl(var(--line-strong))", color: i <= cur ? "white" : "hsl(var(--foreground)/0.5)" }}>
                  {i <= cur && "✓"}
                </div>
                <div className="text-xs mt-3 uppercase tracking-widest" style={{ color: i <= cur ? "hsl(var(--foreground))" : "hsl(var(--foreground)/0.5)" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <div className="overline mb-3 inline-flex items-center gap-2"><Package size={12} /> Items</div>
          <div className="border-t" style={{ borderColor: "hsl(var(--line))" }}>
            {order.items?.map((it, i) => (
              <div key={i} className="flex gap-4 py-5 border-b" style={{ borderColor: "hsl(var(--line))" }}>
                <div className="w-16 h-20 bg-sand shrink-0">{it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}</div>
                <div className="flex-1">
                  <div className="font-serif text-xl">{it.name}</div>
                  {it.custom && <div className="text-xs text-foreground/60 mt-1">{it.custom.nuts?.join(" · ")} · {it.custom.size}</div>}
                  <div className="text-xs text-foreground/60 mt-1">Qty: {it.quantity} · {formatINR(it.price)} each</div>
                </div>
                <div className="font-serif text-lg">{formatINR(it.line_total)}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between" style={{ color: "hsl(var(--gold))" }}><span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span><span>− {formatINR(order.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{order.shipping ? formatINR(order.shipping) : "Free"}</span></div>
            <div className="flex justify-between font-serif text-2xl pt-3 border-t" style={{ borderColor: "hsl(var(--line))" }}>
              <span>Total</span><span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div>
            <div className="overline mb-2 inline-flex items-center gap-2"><MapPin size={12} /> Shipping to</div>
            <div className="text-sm leading-relaxed text-foreground/80">
              <div className="font-medium text-foreground">{order.user_name}</div>
              <div>{order.shipping_address?.line1}</div>
              {order.shipping_address?.line2 && <div>{order.shipping_address.line2}</div>}
              <div>{order.shipping_address?.city}, {order.shipping_address?.state}</div>
              <div>{order.shipping_address?.pincode}, {order.shipping_address?.country}</div>
              {order.phone && <div className="mt-2">{order.phone}</div>}
              <div>{order.user_email}</div>
            </div>
          </div>
          <div>
            <div className="overline mb-2 inline-flex items-center gap-2"><CreditCard size={12} /> Payment</div>
            <div className="text-sm">
              <div>{order.payment_method?.replace("_", " ")}</div>
              <div className="overline mt-1" style={{ color: "hsl(var(--gold))" }}>{order.payment_status}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
