import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]" data-testid="cart-drawer">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-ivory flex flex-col">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "hsl(var(--line))" }}>
          <div>
            <div className="overline">Your Selection</div>
            <h2 className="font-serif text-2xl mt-1">Cart</h2>
          </div>
          <button onClick={() => setOpen(false)} data-testid="cart-drawer-close"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 && (
            <div className="text-center text-foreground/60 py-20">
              <div className="font-serif text-2xl">Your cart is empty</div>
              <p className="mt-2 text-sm">Begin your journey through the Silk Route.</p>
              <Link to="/shop" onClick={() => setOpen(false)} className="btn-ghost mt-8 inline-flex">Browse Shop</Link>
            </div>
          )}
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-4" data-testid={`cart-item-${idx}`}>
              <div className="w-20 h-24 bg-sand shrink-0">
                {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="font-serif text-lg leading-tight">{it.name}</div>
                {it.custom && (
                  <div className="text-[11px] text-foreground/60 mt-1">
                    {it.custom.nuts?.join(" · ")} · {it.custom.size} · {it.custom.texture}
                  </div>
                )}
                <div className="text-sm mt-2">{formatINR(it.price)}</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center border" style={{ borderColor: "hsl(var(--line-strong))" }}>
                    <button onClick={() => updateQty(idx, it.quantity - 1)} className="p-1.5"><Minus size={12} /></button>
                    <span className="px-3 text-sm" data-testid={`cart-qty-${idx}`}>{it.quantity}</span>
                    <button onClick={() => updateQty(idx, it.quantity + 1)} className="p-1.5"><Plus size={12} /></button>
                  </div>
                  <button onClick={() => remove(idx)} className="text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground" data-testid={`cart-remove-${idx}`}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t p-6" style={{ borderColor: "hsl(var(--line))" }}>
            <div className="flex justify-between mb-4">
              <span className="overline">Subtotal</span>
              <span className="font-serif text-2xl" data-testid="cart-subtotal">{formatINR(subtotal)}</span>
            </div>
            <p className="text-xs text-foreground/60 mb-5">Shipping & taxes calculated at checkout.</p>
            <button
              onClick={() => { setOpen(false); navigate("/checkout"); }}
              className="btn-primary w-full"
              data-testid="cart-checkout-button"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
