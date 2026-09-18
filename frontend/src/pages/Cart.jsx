import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { useSEO } from "@/lib/seo";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

export default function Cart() {
  useSEO({ title: "Cart" });
  const { items, updateQty, remove, subtotal, count } = useCart();
  const nav = useNavigate();
  const shipping = subtotal >= 1499 ? 0 : 79;
  const total = subtotal + shipping;

  return (
    <div className="section-pad container-luxe" data-testid="cart-page">
      <div className="overline mb-3">Your selection</div>
      <h1 className="font-serif text-5xl md:text-6xl tracking-tighter">Cart {count > 0 && <span className="text-foreground/40">- {count}</span>}</h1>

      {items.length === 0 ? (
        <div className="mt-16 py-24 text-center" style={{ background: "hsl(var(--background-2))" }}>
          <ShoppingBag size={32} className="mx-auto mb-4" style={{ color: "hsl(var(--gold))" }} />
          <div className="font-serif text-3xl">Your cart is empty.</div>
          <p className="text-foreground/60 mt-3 text-sm">Begin your journey through the Silk Route.</p>
          <Link to="/shop" className="btn-primary mt-8 inline-flex">Browse Shop</Link>
        </div>
      ) : (
        <div className="mt-12 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-8 space-y-6">
            {items.map((it, idx) => (
              <div key={idx} className="flex gap-6 border-b pb-6" style={{ borderColor: "hsl(var(--line))" }} data-testid={`cart-row-${idx}`}>
                <div className="w-24 h-28 bg-sand shrink-0">{it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}</div>
                <div className="flex-1">
                  <div className="font-serif text-2xl leading-tight">{it.name}</div>
                  {it.custom && (
                    <div className="text-xs text-foreground/60 mt-2">
                      {it.custom.nuts?.join(" · ")} · {it.custom.size} · {it.custom.texture}
                      {it.custom.flavors?.length ? " · " + it.custom.flavors.join(", ") : ""}
                    </div>
                  )}
                  <div className="flex items-center gap-5 mt-4">
                    <div className="flex items-center border" style={{ borderColor: "hsl(var(--line-strong))" }}>
                      <button onClick={() => updateQty(idx, it.quantity - 1)} className="p-2"><Minus size={14} /></button>
                      <span className="px-4 text-sm" data-testid={`cart-qty-${idx}`}>{it.quantity}</span>
                      <button onClick={() => updateQty(idx, it.quantity + 1)} className="p-2"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => remove(idx)} className="text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground inline-flex items-center gap-1" data-testid={`cart-remove-${idx}`}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif text-2xl">{formatINR((it.price || 0) * it.quantity)}</div>
                  <div className="text-xs text-foreground/60 mt-1">{formatINR(it.price)} each</div>
                </div>
              </div>
            ))}
          </div>

          <aside className="md:col-span-4 self-start p-8" style={{ background: "hsl(var(--background-2))" }}>
            <div className="overline mb-2">Order summary</div>
            <h3 className="font-serif text-3xl">Total</h3>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span data-testid="cart-page-subtotal">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              <div className="flex justify-between font-serif text-2xl pt-3 border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <span>Total</span><span>{formatINR(total)}</span>
              </div>
              {subtotal < 1499 && (
                <p className="text-xs text-foreground/60 pt-2">Add {formatINR(1499 - subtotal)} more for free shipping.</p>
              )}
            </div>
            <button onClick={() => nav("/checkout")} className="btn-primary w-full mt-6" data-testid="cart-page-checkout">
              Proceed to Checkout
            </button>
            <Link to="/shop" className="btn-ghost w-full mt-3 inline-flex justify-center">Continue Shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
