import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Sparkles, Globe, Flower } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useSEO } from "@/lib/seo";
import { useTheme } from "@/context/ThemeContext";

const SILK_ROUTE_STOPS = [
  { country: "Afghanistan", item: "Mamra Almonds", note: "Hindu Kush, sun-dried" },
  { country: "Iran", item: "Royal Pistachios", note: "Rafsanjan, 1,500 yrs" },
  { country: "Turkey", item: "Imperial Hazelnuts", note: "Black Sea, slow-roasted" },
  { country: "India", item: "Kashmiri Saffron", note: "Pampore, Mongra grade" },
  { country: "Morocco", item: "Medjool Dates", note: "Tafilalet, caravan stop" },
];

const VALUE_PROPS = [
  { icon: Leaf, label: "Pure & Natural", note: "No bleach. No sulphur. No gloss." },
  { icon: Flower, label: "Authentic Ingredients", note: "Sourced at origin, every single lot." },
  { icon: Sparkles, label: "Timeless Traditions", note: "Methods older than the recipes." },
  { icon: Globe, label: "Ethically Sourced", note: "Fair trade, long partnerships." },
];

export default function Home() {
  useSEO({
    title: null,
    description: "Single-origin almonds, pistachios, hazelnuts, dates and saffron from the ancient Silk Route. Slow-cured, hand-graded, luxury heritage superfoods.",
    image: "https://silkroutenaturals.com/banner-desktop.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Silk Route Naturals",
      "url": "https://silkroutenaturals.com",
      "logo": "https://silkroutenaturals.com/logo-light.jpg",
      "sameAs": [],
      "contactPoint": [{ "@type": "ContactPoint", "telephone": "+91-7406-995-999", "contactType": "customer service", "areaServed": "IN" }],
    },
  });
  const [products, setProducts] = useState([]);
  const { theme } = useTheme();
  const SHOW_LEGACY_HERO = false;
  const SHOW_EXPERIENCE_SECTION = false;
  const SHOW_STOREFRONT_ADDRESS_SECTION = false;

  const heroDesktop = theme === "dark" ? "/banner-dark-desktop.png" : "/banner-desktop.png";
  const heroMobile  = theme === "dark" ? "/banner-dark-mobile.jpg" : "/banner-mobile.jpg";

  useEffect(() => {
    api.get("/products?featured=true").then((r) => setProducts(r.data || []));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO (banner-driven). Desktop + mobile variants from client assets, theme-aware. */}
      <section className="relative w-full overflow-hidden" data-testid="hero-banner-section">
        <Link to="/shop" aria-label="Shop the collection" className="block group">
          <picture key={theme}>
            <source media="(min-width: 768px)" srcSet={heroDesktop} />
            <img
              src={heroMobile}
              alt="Silk Route Naturals, Treasures of the Ancient Trade"
              className="w-full h-auto block"
              loading="eager"
              data-testid="hero-banner-image"
            />
          </picture>
        </Link>
      </section>

      {/* VALUE PROPS strip, aligned with banner palette */}
      <section className="py-12 md:py-16 border-b" style={{ borderColor: "hsl(var(--line))", background: "hsl(var(--background))" }}>
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-8">
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.label} className="flex flex-col items-center text-center" data-testid={`value-prop-${v.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ border: "1px solid hsl(var(--gold))" }}>
                  <Icon size={20} style={{ color: "hsl(var(--gold))" }} />
                </div>
                <div className="font-serif text-lg md:text-xl">{v.label}</div>
                <div className="text-xs mt-2 text-foreground/60">{v.note}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LEGACY HERO kept for quick rollback (hidden, not deleted) */}
      {SHOW_LEGACY_HERO && (
        <section className="relative min-h-[78vh] flex items-center overflow-hidden grain" style={{ background: "hsl(var(--background-2))" }}>
          <img
            src="https://images.pexels.com/photos/8465992/pexels-photo-8465992.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-y-0 right-0 w-[42%] hidden lg:block">
            <img src="https://images.pexels.com/photos/4499096/pexels-photo-4499096.jpeg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, hsl(var(--background-2)) 0%, hsl(var(--background-2)/0.4) 30%, transparent 70%)" }} />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, hsl(var(--background)/0.85) 0%, hsl(var(--background)/0.55) 50%, transparent 100%)" }} />
          <div className="container-luxe w-full relative py-20 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 lg:col-span-7">
              <div className="overline mb-5 fade-up">An editorial of slow luxury</div>
              <h1 className="h-display text-5xl sm:text-6xl md:text-7xl lg:text-[96px] xl:text-[112px] leading-[0.92] tracking-tighter fade-up" data-testid="hero-title">
                Treasures from<br />the ancient<br /><em className="not-italic" style={{ color: "hsl(var(--gold))" }}>Silk Route.</em>
              </h1>
              <p className="mt-8 max-w-lg text-base md:text-lg text-foreground/80 leading-relaxed fade-up font-light">
                Single-origin almonds, pistachios, hazelnuts, dates and saffron, sourced from five storied lands, hand-graded and slow-cured at our Bengaluru atelier.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 fade-up">
                <Link to="/shop" className="btn-primary" data-testid="hero-shop-cta">Shop the Collection</Link>
                <Link to="/our-story" className="btn-ghost" data-testid="hero-story-cta">The Journey</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="section-pad">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-12 fade-up">
            <div>
              <div className="overline mb-3">The Collection</div>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Featured harvests</h2>
            </div>
            <Link to="/shop" className="hover-underline text-[12px] tracking-[0.18em] uppercase font-medium hidden md:block">View all</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
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
              For two millennia, caravans crossed deserts and passes carrying what could not be grown closer. Those same harvests still travel. The journey now ends at your door.
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px" style={{ background: "hsl(var(--line-strong))" }}>
            {SILK_ROUTE_STOPS.map((s) => (
              <div key={s.country} className="p-8 fade-up" style={{ background: "hsl(var(--background))" }} data-testid={`route-stop-${s.country}`}>
                <div className="overline">{s.country}</div>
                <div className="font-serif text-2xl mt-3">{s.item}</div>
                <div className="text-xs text-foreground/60 mt-2">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATELIER / Nut butter (always-dark editorial block, theme-independent) */}
      <section className="section-pad" style={{ background: "#1a1815", color: "#f5efe4" }}>
        <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
          <div className="img-zoom aspect-[3/4] max-h-[560px] overflow-hidden" style={{ background: "#1a1815" }}>
            <img src="/product-detail.jpg" alt="Silk Route Naturals fresh nut butter atelier" className="w-full h-full object-cover object-center" />
          </div>
          <div className="fade-up">
            <div className="overline" style={{ color: "hsl(var(--gold))" }}>The Atelier</div>
            <h2 className="font-serif text-5xl md:text-6xl tracking-tight mt-4 leading-none" style={{ color: "#f5efe4" }}>
              Design your<br/>own jar.
            </h2>
            <p className="mt-8 leading-relaxed max-w-md" style={{ color: "rgba(245, 239, 228, 0.75)" }}>
              Almond, cashew, pistachio, hazelnut. Raw or roasted. Honey, dates, saffron, cinnamon. Smooth or crunchy. Stone-ground to order at our atelier.
            </p>
            <Link to="/nut-butter-builder" className="inline-flex mt-10 px-8 py-4 text-[12px] tracking-[0.18em] uppercase font-medium border" style={{ borderColor: "hsl(var(--gold))", color: "hsl(var(--gold))" }} data-testid="atelier-cta">
              Build Your Jar
            </Link>
          </div>
        </div>
      </section>

      {/* IN STORE categories */}
      <section className="section-pad">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-16 fade-up">
            <div className="overline mb-4">Inside the atelier</div>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">More than dry fruits.</h2>
            <p className="mt-6 text-foreground/70 leading-relaxed">A small house of fresh nut butters, cold-pressed oils, herbal elixirs and slow-craft milks, made by hand at our atelier.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "hsl(var(--line-strong))" }}>
            {[
              { label: "Fresh Nut Butters", note: "Stone-ground to order" },
              { label: "Cold-Pressed Oils", note: "Almond, sesame, walnut" },
              { label: "Herbal Elixirs", note: "Saffron, ashwagandha, tulsi" },
              { label: "Nut Milks & Juices", note: "Made fresh daily" },
            ].map((c) => (
              <div key={c.label} className="p-8 fade-up" style={{ background: "hsl(var(--background))" }}>
                <div className="overline" style={{ color: "hsl(var(--gold))" }}>House made</div>
                <div className="font-serif text-2xl mt-3 leading-tight">{c.label}</div>
                <div className="text-xs text-foreground/60 mt-2">{c.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE CENTER (hidden per client feedback, kept for rollback) */}
      {SHOW_EXPERIENCE_SECTION && (
        <section className="section-pad">
          <div className="container-luxe grid md:grid-cols-12 gap-10">
            <div className="md:col-span-5 fade-up">
              <div className="overline mb-3">Our atelier</div>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight">The Experience Center.</h2>
              <p className="mt-6 text-foreground/70 leading-relaxed">
                A quiet room of cold-press oil mills, fresh nut butter machines, and tasting flights. Walk in by appointment.
              </p>
              <Link to="/experience-center" className="btn-primary mt-8 inline-flex" data-testid="experience-cta">Book a Tasting</Link>
            </div>
            <div className="md:col-span-7">
              <div className="img-zoom aspect-[4/5] h-full overflow-hidden">
                <img src="/store-interior.jpg" alt="Inside the atelier" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STOREFRONT address block (hidden per client feedback, kept for rollback) */}
      {SHOW_STOREFRONT_ADDRESS_SECTION && (
        <section className="relative h-[55vh] md:h-[60vh] flex items-center overflow-hidden" style={{ background: "#0a0908" }}>
          <img src="/storefront-sign.jpg" alt="Silk Route Naturals storefront" className="absolute inset-0 w-full h-full object-cover opacity-90" style={{ objectPosition: "right center" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.15) 75%)" }} />
          <div className="container-luxe w-full relative">
            <div className="max-w-md text-white fade-up">
              <div className="overline mb-5" style={{ color: "hsl(var(--gold))" }}>Visit us</div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-[0.95]">100 Ft Road,<br/>Indiranagar.</h2>
              <p className="mt-5 text-white/80 max-w-sm text-sm md:text-base">Tuesday to Sunday, 11:00 to 20:00. By appointment for tastings and private workshops.</p>
              <Link to="/contact" className="inline-flex mt-8 px-8 py-4 text-[12px] tracking-[0.18em] uppercase font-medium border" style={{ borderColor: "hsl(var(--gold))", color: "hsl(var(--gold))" }}>
                Get Directions
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* QUOTE */}
      <section className="py-32" style={{ background: "hsl(var(--background-2))" }}>
        <div className="container-luxe text-center fade-up max-w-3xl mx-auto">
          <div className="gold-line mx-auto mb-8" />
          <blockquote className="font-serif text-3xl md:text-5xl leading-tight tracking-tight">
            "We carry, preserve, and pass on a 2,000-year-old harvest."
          </blockquote>
          <div className="overline mt-8">Silk Route Naturals</div>
        </div>
      </section>
    </div>
  );
}
