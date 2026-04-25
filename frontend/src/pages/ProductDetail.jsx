import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSEO } from "@/lib/seo";
import { Star, Plus, Minus, Heart } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, title: "", body: "" });

  const load = () => api.get(`/products/${slug}`).then((r) => setP(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  useSEO(p ? {
    title: p.name,
    description: `${p.tagline}. ${p.description.slice(0, 140)}`,
    image: p.images?.[0],
    type: "product",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "description": p.description,
      "image": p.images || [],
      "brand": { "@type": "Brand", "name": "Silkroute Naturals" },
      "offers": {
        "@type": "Offer",
        "price": p.price,
        "priceCurrency": "INR",
        "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
      ...(p.avg_rating ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": p.avg_rating, "reviewCount": p.reviews?.length || 0 } } : {}),
    },
  } : { title: "Product" });

  if (!p) return <div className="container-luxe py-32 text-foreground/60">Loading...</div>;

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to review."); return; }
    try {
      await api.post("/reviews", { product_id: p.id, ...review });
      toast.success("Review submitted");
      setReview({ rating: 5, title: "", body: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div data-testid="product-detail-page">
      <div className="container-luxe pt-12 text-xs text-foreground/60">
        <Link to="/shop" className="hover-underline">Shop</Link> · <span>{p.origin}</span> · <span>{p.name}</span>
      </div>

      <section className="py-12 grid md:grid-cols-12 gap-10 container-luxe">
        <div className="md:col-span-7">
          <div className="bg-sand aspect-[4/5] overflow-hidden">
            {p.images?.[activeImg] && <img src={p.images[activeImg]} alt={p.name} className="w-full h-full object-cover" />}
          </div>
          {p.images?.length > 1 && (
            <div className="mt-3 flex gap-3">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-24 ${activeImg === i ? "ring-1 ring-foreground" : ""}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-5 md:pl-8">
          <div className="overline">{p.origin}</div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tighter mt-3 leading-none" data-testid="product-detail-name">{p.name}</h1>
          <p className="mt-4 text-foreground/70 italic">{p.tagline}</p>

          <div className="flex items-baseline gap-3 mt-8">
            <span className="font-serif text-3xl" data-testid="product-detail-price">{formatINR(p.price)}</span>
            {p.compare_at_price && p.compare_at_price > p.price && (
              <span className="text-foreground/50 line-through text-sm">{formatINR(p.compare_at_price)}</span>
            )}
            <span className="text-xs text-foreground/60 ml-2">{p.weight}</span>
          </div>

          {p.avg_rating > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-foreground/70">
              {Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill={i < Math.round(p.avg_rating) ? "hsl(var(--gold))" : "none"} stroke="hsl(var(--gold))" />)}
              <span>{p.avg_rating} ({p.reviews?.length || 0})</span>
            </div>
          )}

          <p className="mt-8 leading-relaxed text-foreground/80">{p.description}</p>

          <div className="my-8 border-t border-b py-6" style={{ borderColor: "hsl(var(--line))" }}>
            <div className="overline mb-4">Notes</div>
            <ul className="space-y-2 text-sm">
              {p.benefits?.map((b) => <li key={b} className="flex items-start gap-2"><span style={{ color: "hsl(var(--gold))" }}>—</span>{b}</li>)}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border" style={{ borderColor: "hsl(var(--line-strong))" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3"><Minus size={14} /></button>
              <span className="px-4" data-testid="product-qty">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3"><Plus size={14} /></button>
            </div>
            <button onClick={() => { addItem(p, qty); toast.success(`${p.name} added to cart`); }} className="btn-primary flex-1" data-testid="add-to-cart-button">
              Add to Cart
            </button>
            <button
              onClick={() => { toggle(p); toast.success(has(p.id) ? "Removed from wishlist" : "Saved to wishlist"); }}
              className="p-4 border"
              style={{ borderColor: "hsl(var(--line-strong))" }}
              aria-label="wishlist"
              data-testid="product-wishlist-toggle"
            >
              <Heart size={16} fill={has(p.id) ? "hsl(var(--gold))" : "none"} stroke={has(p.id) ? "hsl(var(--gold))" : "currentColor"} />
            </button>
          </div>

          {p.story && (
            <div className="mt-12 p-6" style={{ background: "hsl(var(--background-2))" }}>
              <div className="overline mb-3">Origin story</div>
              <p className="font-serif text-xl leading-snug">{p.story}</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="section-pad" style={{ background: "hsl(var(--background-2))" }}>
        <div className="container-luxe grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="overline mb-3">Voices</div>
            <h2 className="font-serif text-4xl">Customer reviews</h2>
            <form onSubmit={submitReview} className="mt-8 space-y-5" data-testid="review-form">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button type="button" key={n} onClick={() => setReview({ ...review, rating: n })}>
                    <Star size={20} fill={n <= review.rating ? "hsl(var(--gold))" : "none"} stroke="hsl(var(--gold))" />
                  </button>
                ))}
              </div>
              <input className="luxe-input" placeholder="Title" value={review.title} onChange={(e) => setReview({ ...review, title: e.target.value })} required />
              <textarea className="luxe-input min-h-[100px]" placeholder="Your impressions..." value={review.body} onChange={(e) => setReview({ ...review, body: e.target.value })} required />
              <button className="btn-primary" data-testid="review-submit">Submit Review</button>
            </form>
          </div>
          <div className="md:col-span-7 space-y-8">
            {(p.reviews || []).length === 0 && <p className="text-foreground/60">Be the first to review.</p>}
            {(p.reviews || []).map((r) => (
              <div key={r.id} className="border-b pb-6" style={{ borderColor: "hsl(var(--line))" }}>
                <div className="flex gap-1 mb-2">
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "hsl(var(--gold))" : "none"} stroke="hsl(var(--gold))" />)}
                </div>
                <div className="font-serif text-xl">{r.title}</div>
                <div className="text-xs text-foreground/60 mt-1">— {r.user_name}</div>
                <p className="mt-3 text-sm text-foreground/80">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
