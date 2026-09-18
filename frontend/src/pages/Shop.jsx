import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useSEO } from "@/lib/seo";

const CATS = ["all", "almonds", "pistachios", "hazelnuts", "cashews", "dates", "spices", "walnuts", "dried-fruits"];
const ORIGINS = ["all", "Afghanistan", "Iran", "Turkey", "India", "Morocco"];

export default function Shop() {
  useSEO({ title: "Shop the Collection", description: "Browse 10 single-origin harvests, Mamra almonds, Royal pistachios, Imperial hazelnuts, Medjool dates, Kashmiri saffron and more.", image: "https://images.pexels.com/photos/5425018/pexels-photo-5425018.jpeg" });
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("all");
  const [origin, setOrigin] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => { api.get("/products").then((r) => setProducts(r.data || [])); }, []);

  const filtered = useMemo(() => {
    let out = products.slice();
    if (cat !== "all") out = out.filter((p) => p.category === cat);
    if (origin !== "all") out = out.filter((p) => p.origin === origin);
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [products, cat, origin, sort]);

  return (
    <div data-testid="shop-page">
      <section className="pt-20 pb-12 border-b" style={{ borderColor: "hsl(var(--line))" }}>
        <div className="container-luxe">
          <div className="overline mb-4">The Collection</div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none">All harvests.</h1>
          <p className="mt-6 max-w-md text-foreground/70">Ten origins, hand-graded, slow-cured. Filter by terroir, taste or price.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b" style={{ borderColor: "hsl(var(--line))" }}>
        <div className="container-luxe flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="overline mr-2">Category</span>
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`text-[11px] tracking-[0.16em] uppercase px-3 py-1.5 ${cat === c ? "bg-foreground text-ivory" : "border border-line hover:border-foreground"}`} data-testid={`filter-cat-${c}`}>
                {c.replace("-", " ")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="bg-transparent border-b border-line text-sm py-1 pr-6" data-testid="filter-origin">
              {ORIGINS.map((o) => <option key={o} value={o}>Origin: {o}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent border-b border-line text-sm py-1 pr-6" data-testid="filter-sort">
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-luxe">
          {filtered.length === 0 ? (
            <div className="text-center py-32 text-foreground/60">
              <div className="font-serif text-3xl">Nothing in that selection.</div>
              <p className="text-sm mt-3">Try a different origin or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14" data-testid="shop-grid">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
