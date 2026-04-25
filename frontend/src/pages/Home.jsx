import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const SILK_ROUTE_STOPS = [
  { country: "Afghanistan", item: "Mamra Almonds", note: "Hindu Kush · sun-dried" },
  { country: "Iran", item: "Royal Pistachios", note: "Rafsanjan · 1,500 yrs" },
  { country: "Turkey", item: "Imperial Hazelnuts", note: "Black Sea · slow-roasted" },
  { country: "India", item: "Kashmiri Saffron", note: "Pampore · Mongra grade" },
  { country: "Morocco", item: "Medjool Dates", note: "Tafilalet · caravan stop" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    api.get("/products?featured=true").then((r) => setProducts(r.data || []));
    api.get("/banners").then((r) => setBanner(r.data?.[0] || null));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden grain">
        <img
          src={banner?.image || "https://images.pexels.com/photos/9494903/pexels-photo-9494903.jpeg"}
          alt="Silk Route map"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background)/0.55) 0%, hsl(var(--background)/0.2) 40%, hsl(var(--background)/0.95) 100%)" }} />
        <div className="container-luxe relative pb-20 md:pb-32 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-7">
            <div className="overline mb-6 fade-up">An editorial of slow luxury</div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tighter fade-up" data-testid="hero-title">
              Treasures from<br />the ancient<br /><em className="not-italic" style={{ color: "hsl(var(--gold))" }}>Silk Route.</em>
            </h1>
            <p className="mt-8 max-w-md text-base text-foreground/75 leading-relaxed fade-up">
              Single-origin almonds, pistachios, hazelnuts, dates and saffron — sourced from five storied lands, hand-graded and slow-cured.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 fade-up">
              <Link to="/shop" className="btn-primary" data-testid="hero-shop-cta">Shop the Collection</Link>
              <Link to="/our-story" className="btn-ghost" data-testid="hero-story-cta">The Journey</Link>
            </div>
          </div>
          <div className="hidden md:block md:col-span-5">
            <div className="border-l pl-8 ml-auto max-w-xs fade-up" style={{ borderColor: "hsl(var(--gold))" }}>
              <div className="overline mb-3">Est. on a heritage trail</div>
              <p className="font-serif text-2xl leading-snug">
                "What was once paid for in silk, we now pay for in care."
              </p>
              <p className="text-xs mt-4 text-foreground/60">— The Silkroute Charter</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROUTE STOPS */}
      <section className="section-pad" style={{ background: "hsl(var(--background-2))" }}>
        <div className="container-luxe">
          <div className="grid md:grid-cols-12 gap-12 items-end mb-16">
            <div className="md:col-span-6">
              <div className="overline mb-4">The five lands</div>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight">A map drawn in stone, salt, and saffron.</h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 text-foreground/70 leading-relaxed">
              For two millennia, caravans crossed deserts and passes carrying what could not be grown closer. Today, those same harvests still travel — only now, the journey ends at your door.
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px" style={{ background: "hsl(var(--line-strong))" }}>
            {SILK_ROUTE_STOPS.map((s) => (
              <div key={s.country} className="bg-ivory p-8 fade-up" data-testid={`route-stop-${s.country}`}>
                <div className="overline">{s.country}</div>
                <div className="font-serif text-2xl mt-3">{s.item}</div>
                <div className="text-xs text-foreground/60 mt-2">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section-pad">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-12 fade-up">
            <div>
              <div className="overline mb-3">The Collection</div>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Featured harvests</h2>
            </div>
            <Link to="/shop" className="hover-underline text-[12px] tracking-[0.18em] uppercase font-medium hidden md:block">View all →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* ATELIER / Nut butter */}
      <section className="section-pad" style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}>
        <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
          <div className="img-zoom">
            <img src="https://images.pexels.com/photos/33657317/pexels-photo-33657317.jpeg" alt="Nut butter atelier" className="w-full aspect-[4/5] object-cover" />
          </div>
          <div className="fade-up">
            <div className="overline" style={{ color: "hsl(var(--gold))" }}>The Atelier</div>
            <h2 className="font-serif text-5xl md:text-6xl tracking-tight mt-4 leading-none">
              Design your<br/>own jar.
            </h2>
            <p className="mt-8 leading-relaxed text-white/70 max-w-md">
              Almond, cashew, pistachio, hazelnut. Raw or roasted. Honey, dates, saffron, cinnamon. Smooth or crunchy. Stone-ground to order in our Bengaluru atelier.
            </p>
            <Link to="/nut-butter-builder" className="inline-flex mt-10 px-8 py-4 text-[12px] tracking-[0.18em] uppercase font-medium border" style={{ borderColor: "hsl(var(--gold))", color: "hsl(var(--gold))" }} data-testid="atelier-cta">
              Build Your Jar
            </Link>
          </div>
        </div>
      </section>

      {/* EXPERIENCE CENTER */}
      <section className="section-pad">
        <div className="container-luxe grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 fade-up">
            <div className="overline mb-3">Indiranagar</div>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight">The Experience Center.</h2>
            <p className="mt-6 text-foreground/70 leading-relaxed">
              Our Bengaluru atelier is a quiet room of cold-press oil mills, fresh nut butter machines, and tasting flights. By appointment only.
            </p>
            <Link to="/experience-center" className="btn-primary mt-8 inline-flex" data-testid="experience-cta">Book a Tasting</Link>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <div className="img-zoom aspect-[3/4]"><img src="https://images.pexels.com/photos/35045845/pexels-photo-35045845.jpeg" alt="" className="w-full h-full object-cover" /></div>
            <div className="img-zoom aspect-[3/4] mt-12"><img src="https://images.unsplash.com/photo-1769697064243-889f2e25d44a" alt="" className="w-full h-full object-cover" /></div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="py-32" style={{ background: "hsl(var(--background-2))" }}>
        <div className="container-luxe text-center fade-up max-w-3xl mx-auto">
          <div className="gold-line mx-auto mb-8" />
          <blockquote className="font-serif text-3xl md:text-5xl leading-tight tracking-tight">
            "We do not sell dry fruits. We carry, preserve, and pass on a 2,000-year-old harvest."
          </blockquote>
          <div className="overline mt-8">Silkroute Charter, 2024</div>
        </div>
      </section>
    </div>
  );
}
