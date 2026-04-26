import { Link, useLocation, useParams } from "react-router-dom";
import { formatINR } from "@/lib/format";
import { useSEO } from "@/lib/seo";
import { Check } from "lucide-react";

export default function OrderConfirmed() {
  useSEO({ title: "Order Confirmed" });
  const { number } = useParams();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="section-pad container-luxe max-w-3xl text-center" data-testid="order-confirmed-page">
      <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style={{ background: "hsl(var(--gold))", color: "white" }}>
        <Check size={26} />
      </div>
      <div className="overline mt-6">Order received</div>
      <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mt-3 leading-none">Thank you.</h1>
      <p className="mt-6 text-foreground/70">
        Your order <span className="font-mono text-foreground" data-testid="order-confirmed-number">#{number}</span> has been placed. A confirmation has been sent to your email.
      </p>
      {order && (
        <div className="mt-12 text-left p-8" style={{ background: "hsl(var(--background-2))" }}>
          <div className="overline mb-3">Summary</div>
          <div className="space-y-3">
            {order.items?.map((it, i) => (
              <div key={i} className="flex justify-between text-sm border-b pb-3" style={{ borderColor: "hsl(var(--line))" }}>
                <span>{it.name} × {it.quantity}</span>
                <span>{formatINR(it.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between font-serif text-2xl">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </div>
        </div>
      )}
      <Link to="/shop" className="btn-primary mt-12 inline-flex">Continue Shopping</Link>
    </div>
  );
}
