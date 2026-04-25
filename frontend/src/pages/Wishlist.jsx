import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { useSEO } from "@/lib/seo";
import { Heart, X, ShoppingBag } from "lucide-react";

export default function Wishlist() {
  useSEO({ title: "Wishlist", description: "Your saved harvests at Silkroute Naturals." });
  const { items, remove, clear } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="section-pad container-luxe" data-testid="wishlist-page">
      <div className="overline mb-3">Saved</div>
      <h1 className="font-serif text-5xl md:text-6xl tracking-tighter">Wishlist.</h1>
      {items.length === 0 ? (
        <div className="mt-16 py-24 text-center" style={{ background: "hsl(var(--background-2))" }}>
          <Heart size={32} className="mx-auto mb-4" style={{ color: "hsl(var(--gold))" }} />
          <div className="font-serif text-3xl">Nothing saved yet.</div>
          <p className="text-foreground/60 mt-3 text-sm">Tap the heart on any harvest to keep it for later.</p>
          <Link to="/shop" className="btn-primary mt-8 inline-flex">Browse Shop</Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end mt-8">
            <button onClick={clear} className="text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground" data-testid="wishlist-clear">Clear all</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mt-6">
            {items.map((p) => (
              <div key={p.id} className="group" data-testid={`wishlist-item-${p.slug}`}>
                <Link to={`/product/${p.slug}`} className="block img-zoom bg-sand aspect-[4/5]">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                </Link>
                <div className="mt-4 flex justify-between gap-3">
                  <div>
                    <div className="overline">{p.origin}</div>
                    <Link to={`/product/${p.slug}`} className="font-serif text-xl leading-tight">{p.name}</Link>
                    <div className="text-sm mt-1">{formatINR(p.price)}</div>
                  </div>
                  <button onClick={() => remove(p.id)} aria-label="remove" className="p-2 hover:bg-sand"><X size={14} /></button>
                </div>
                <button onClick={() => addItem({ id: p.id, name: p.name, price: p.price, images: [p.image] }, 1)} className="btn-ghost w-full mt-4 text-[11px] py-3" data-testid={`wishlist-add-cart-${p.slug}`}>
                  <ShoppingBag size={12} className="mr-1" /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
