import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({ p }) {
  const img = (p.images && p.images[0]) || "";
  const { has, toggle } = useWishlist();
  const saved = has(p.id);
  return (
    <div className="group relative" data-testid={`product-card-${p.slug}`}>
      <button
        onClick={(e) => { e.preventDefault(); toggle(p); }}
        aria-label="wishlist"
        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-ivory/85 backdrop-blur-sm hover:bg-ivory transition-colors"
        data-testid={`wishlist-toggle-${p.slug}`}
      >
        <Heart size={14} fill={saved ? "hsl(var(--gold))" : "none"} stroke={saved ? "hsl(var(--gold))" : "currentColor"} />
      </button>
      <Link to={`/product/${p.slug}`} className="block">
        <div className="img-zoom bg-sand aspect-[4/5] overflow-hidden">
          {img && <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />}
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="overline" data-testid={`product-origin-${p.slug}`}>{p.origin}</div>
            <h3 className="font-serif text-xl mt-1 leading-tight" data-testid={`product-name-${p.slug}`}>{p.name}</h3>
            <p className="text-xs text-foreground/60 mt-1">{p.weight}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-medium" data-testid={`product-price-${p.slug}`}>{formatINR(p.price)}</div>
            {p.compare_at_price && p.compare_at_price > p.price && (
              <div className="text-xs text-foreground/50 line-through">{formatINR(p.compare_at_price)}</div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
