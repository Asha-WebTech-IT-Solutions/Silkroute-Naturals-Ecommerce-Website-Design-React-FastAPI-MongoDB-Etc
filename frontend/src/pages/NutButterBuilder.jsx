import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useSEO } from "@/lib/seo";
import { Check } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { key: "nuts", title: "Choose your base", overline: "Step 01" },
  { key: "raw_or_roasted", title: "Raw or roasted", overline: "Step 02" },
  { key: "roast_level", title: "Roast level", overline: "Step 03" },
  { key: "flavors", title: "A whisper of flavor", overline: "Step 04" },
  { key: "texture", title: "Texture", overline: "Step 05" },
  { key: "size", title: "Size", overline: "Step 06" },
];

const NUTS = [
  { id: "almond", name: "Mamra Almond", origin: "Afghanistan", img: "https://images.unsplash.com/photo-1633677491262-0a51b9851f46" },
  { id: "cashew", name: "Golden Cashew", origin: "India", img: "https://images.pexels.com/photos/5425018/pexels-photo-5425018.jpeg" },
  { id: "pistachio", name: "Royal Pistachio", origin: "Iran", img: "https://images.pexels.com/photos/34746904/pexels-photo-34746904.jpeg" },
  { id: "hazelnut", name: "Imperial Hazelnut", origin: "Turkey", img: "https://images.pexels.com/photos/5425018/pexels-photo-5425018.jpeg" },
];
const FLAVORS = [
  { id: "honey", name: "Wild Honey" },
  { id: "chocolate", name: "Dark Chocolate" },
  { id: "dates", name: "Medjool Dates" },
  { id: "cinnamon", name: "Ceylon Cinnamon" },
  { id: "saffron", name: "Kashmiri Saffron" },
];

export default function NutButterBuilder() {
  useSEO({ title: "Custom Nut Butter Atelier", description: "Design your own jar — choose your nuts, roast, flavors, texture and size. Stone-ground to order.", image: "https://images.pexels.com/photos/33657317/pexels-photo-33657317.jpeg" });
  const { addItem } = useCart();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    nuts: [], raw_or_roasted: "roasted", roast_level: "medium", flavors: [], texture: "smooth", size: "500g",
  });
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    if (config.nuts.length === 0) { setPricing(null); return; }
    api.post("/custom-nut-butter/price", config).then((r) => setPricing(r.data));
  }, [config]);

  const toggleNut = (id) => setConfig((c) => ({ ...c, nuts: c.nuts.includes(id) ? c.nuts.filter((n) => n !== id) : [...c.nuts, id] }));
  const toggleFlavor = (id) => setConfig((c) => ({ ...c, flavors: c.flavors.includes(id) ? c.flavors.filter((f) => f !== id) : [...c.flavors, id] }));
  const canAdvance = useMemo(() => {
    if (step === 0) return config.nuts.length > 0;
    if (step === 2 && config.raw_or_roasted === "raw") return true;
    return true;
  }, [step, config]);

  const addToCart = () => {
    if (!pricing) return;
    const name = `Custom — ${config.nuts.map((n) => n[0].toUpperCase() + n.slice(1)).join(" + ")} (${config.size})`;
    addItem({ id: `custom-${Date.now()}`, name, price: pricing.price, image: "https://images.pexels.com/photos/33657317/pexels-photo-33657317.jpeg" }, 1, config);
    toast.success("Custom jar added to cart");
  };

  return (
    <div data-testid="nut-butter-builder">
      <section className="py-16 border-b" style={{ borderColor: "hsl(var(--line))", background: "hsl(var(--background-2))" }}>
        <div className="container-luxe">
          <div className="overline mb-3">The Atelier</div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none">Build your jar.</h1>
          <p className="mt-5 max-w-xl text-foreground/70">Six considered choices. Stone-ground to order in our Bengaluru atelier and shipped within seven days.</p>
        </div>
      </section>

      <section className="py-12 grid md:grid-cols-12 container-luxe gap-10">
        {/* Steps sidebar */}
        <aside className="md:col-span-3">
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.key}>
                <button onClick={() => setStep(i)} className={`text-left w-full py-2 border-b ${step === i ? "border-foreground" : "border-line"}`} data-testid={`builder-step-${i}`}>
                  <div className="overline" style={{ color: step === i ? "hsl(var(--gold))" : undefined }}>{s.overline}</div>
                  <div className="font-serif text-xl mt-1">{s.title}</div>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        {/* Step content */}
        <div className="md:col-span-6">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-5">
              {NUTS.map((n) => {
                const active = config.nuts.includes(n.id);
                return (
                  <button key={n.id} onClick={() => toggleNut(n.id)} data-testid={`nut-${n.id}`}
                    className={`text-left bg-sand p-3 transition ${active ? "ring-1 ring-foreground" : ""}`}>
                    <div className="aspect-square overflow-hidden bg-ivory">
                      <img src={n.img} alt={n.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <div className="overline">{n.origin}</div>
                        <div className="font-serif text-lg">{n.name}</div>
                      </div>
                      {active && <Check size={16} style={{ color: "hsl(var(--gold))" }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-5">
              {[{ id: "raw", title: "Raw", note: "Pure, untouched, slightly grassy." }, { id: "roasted", title: "Roasted", note: "Deeper, nuttier, caramelised." }].map((o) => (
                <button key={o.id} onClick={() => setConfig((c) => ({ ...c, raw_or_roasted: o.id }))} className={`p-8 text-left bg-sand ${config.raw_or_roasted === o.id ? "ring-1 ring-foreground" : ""}`} data-testid={`raw-${o.id}`}>
                  <div className="font-serif text-3xl">{o.title}</div>
                  <p className="text-sm mt-2 text-foreground/70">{o.note}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && config.raw_or_roasted === "raw" && (
            <div className="p-8 bg-sand text-foreground/70">Raw selected — no roast level needed. Continue to flavors.</div>
          )}
          {step === 2 && config.raw_or_roasted === "roasted" && (
            <div className="grid grid-cols-3 gap-5">
              {["light", "medium", "dark"].map((l) => (
                <button key={l} onClick={() => setConfig((c) => ({ ...c, roast_level: l }))} className={`p-6 text-left bg-sand ${config.roast_level === l ? "ring-1 ring-foreground" : ""}`} data-testid={`roast-${l}`}>
                  <div className="font-serif text-2xl capitalize">{l}</div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              {FLAVORS.map((f) => {
                const active = config.flavors.includes(f.id);
                return (
                  <button key={f.id} onClick={() => toggleFlavor(f.id)} className={`p-5 text-left bg-sand flex justify-between ${active ? "ring-1 ring-foreground" : ""}`} data-testid={`flavor-${f.id}`}>
                    <span className="font-serif text-xl">{f.name}</span>
                    {active && <Check size={16} style={{ color: "hsl(var(--gold))" }} />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-2 gap-5">
              {[{ id: "smooth", title: "Smooth", note: "Velvet, spreadable, classic." }, { id: "crunchy", title: "Crunchy", note: "With nut chunks, more texture." }].map((o) => (
                <button key={o.id} onClick={() => setConfig((c) => ({ ...c, texture: o.id }))} className={`p-8 text-left bg-sand ${config.texture === o.id ? "ring-1 ring-foreground" : ""}`} data-testid={`texture-${o.id}`}>
                  <div className="font-serif text-3xl">{o.title}</div>
                  <p className="text-sm mt-2 text-foreground/70">{o.note}</p>
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-3 gap-5">
              {["200g", "500g", "1kg"].map((s) => (
                <button key={s} onClick={() => setConfig((c) => ({ ...c, size: s }))} className={`p-8 text-center bg-sand ${config.size === s ? "ring-1 ring-foreground" : ""}`} data-testid={`size-${s}`}>
                  <div className="font-serif text-3xl">{s}</div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-12">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-30" data-testid="builder-prev">← Back</button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canAdvance} className="btn-primary disabled:opacity-30" data-testid="builder-next">Next →</button>
            ) : (
              <button onClick={addToCart} disabled={!pricing} className="btn-primary disabled:opacity-30" data-testid="builder-add-to-cart">Add to Cart · {pricing ? formatINR(pricing.price) : "—"}</button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <aside className="md:col-span-3 self-start">
          <div className="bg-sand p-6">
            <div className="aspect-square overflow-hidden bg-ivory mb-5">
              <img src="https://images.pexels.com/photos/33657317/pexels-photo-33657317.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="overline mb-2">Your jar</div>
            <div className="font-serif text-2xl leading-tight">{config.nuts.length === 0 ? "Begin by choosing a base" : config.nuts.map((n) => n[0].toUpperCase() + n.slice(1)).join(" + ")}</div>
            <div className="text-xs text-foreground/60 mt-3 space-y-1">
              <div>{config.raw_or_roasted}{config.raw_or_roasted === "roasted" ? ` · ${config.roast_level} roast` : ""}</div>
              {config.flavors.length > 0 && <div>+ {config.flavors.join(", ")}</div>}
              <div>{config.texture} · {config.size}</div>
            </div>
            {pricing && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <div className="overline">Live price</div>
                <div className="font-serif text-3xl mt-1" data-testid="builder-live-price">{formatINR(pricing.price)}</div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
