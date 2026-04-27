import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useSEO } from "@/lib/seo";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { key: "nuts",            title: "Choose your base",     overline: "Step 01" },
  { key: "raw_or_roasted",  title: "Raw or roasted",       overline: "Step 02" },
  { key: "roast_level",     title: "Roast level",          overline: "Step 03" },
  { key: "flavors",         title: "A whisper of flavor",  overline: "Step 04" },
  { key: "texture",         title: "Texture",              overline: "Step 05" },
  { key: "size",            title: "Size",                 overline: "Step 06" },
];

const NUTS = [
  { id: "almond",    name: "Mamra Almond",       origin: "Afghanistan", img: "https://images.unsplash.com/photo-1633677491262-0a51b9851f46" },
  { id: "cashew",    name: "Golden Cashew",      origin: "India",       img: "https://images.pexels.com/photos/5425018/pexels-photo-5425018.jpeg" },
  { id: "pistachio", name: "Royal Pistachio",    origin: "Iran",        img: "https://images.pexels.com/photos/34746904/pexels-photo-34746904.jpeg" },
  { id: "hazelnut",  name: "Imperial Hazelnut",  origin: "Turkey",      img: "https://images.pexels.com/photos/5425018/pexels-photo-5425018.jpeg" },
];
const FLAVORS = [
  { id: "honey",     name: "Wild Honey",        note: "+₹80" },
  { id: "chocolate", name: "Dark Chocolate",    note: "+₹120" },
  { id: "dates",     name: "Medjool Dates",     note: "+₹100" },
  { id: "cinnamon",  name: "Ceylon Cinnamon",   note: "+₹50" },
  { id: "saffron",   name: "Kashmiri Saffron",  note: "+₹250" },
];

export default function NutButterBuilder() {
  useSEO({ title: "Custom Nut Butter Atelier", description: "Design your own jar — choose your nuts, roast, flavors, texture and size. Stone-ground to order." });
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

  // skip roast level when raw selected
  const visibleSteps = STEPS.filter((s, i) => !(i === 2 && config.raw_or_roasted === "raw"));
  const stepIndex = visibleSteps.findIndex((s) => s.key === STEPS[step].key);

  const canAdvance = (() => {
    if (step === 0) return config.nuts.length > 0;
    return true;
  })();

  const goNext = () => {
    let nx = step + 1;
    if (nx === 2 && config.raw_or_roasted === "raw") nx = 3;
    if (nx >= STEPS.length) return;
    setStep(nx);
  };
  const goPrev = () => {
    let pr = step - 1;
    if (pr === 2 && config.raw_or_roasted === "raw") pr = 1;
    if (pr < 0) return;
    setStep(pr);
  };

  const addToCart = () => {
    if (!pricing) return;
    const name = `Custom — ${config.nuts.map((n) => n[0].toUpperCase() + n.slice(1)).join(" + ")} (${config.size})`;
    addItem({ id: `custom-${Date.now()}`, name, price: pricing.price, image: "https://images.pexels.com/photos/33657317/pexels-photo-33657317.jpeg" }, 1, config);
    toast.success("Custom jar added to cart");
  };

  return (
    <div data-testid="nut-butter-builder">
      {/* Hero / Intro */}
      <section className="py-14 border-b" style={{ borderColor: "hsl(var(--line))", background: "hsl(var(--background-2))" }}>
        <div className="container-luxe text-center max-w-2xl mx-auto">
          <div className="overline mb-3">The Atelier</div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none">Build your jar.</h1>
          <p className="mt-5 text-foreground/70">Six considered choices. Stone-ground to order in our Bengaluru atelier and shipped within seven days.</p>
        </div>
      </section>

      {/* Progress bar */}
      <div className="sticky top-[88px] z-20 bg-ivory border-b" style={{ borderColor: "hsl(var(--line))" }}>
        <div className="container-luxe py-4">
          <div className="flex items-center justify-between gap-3 overflow-x-auto">
            {visibleSteps.map((s, i) => {
              const isActive = STEPS[step].key === s.key;
              const isDone = visibleSteps.findIndex((vs) => vs.key === STEPS[step].key) > i;
              return (
                <button key={s.key} onClick={() => setStep(STEPS.findIndex((ss) => ss.key === s.key))} className="flex-1 min-w-[100px] text-left flex items-center gap-2" data-testid={`builder-step-${s.key}`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0"
                    style={{
                      background: isActive ? "hsl(var(--foreground))" : isDone ? "hsl(var(--gold))" : "transparent",
                      color: isActive || isDone ? "white" : "hsl(var(--foreground)/0.5)",
                      border: isActive || isDone ? "none" : "1px solid hsl(var(--line-strong))",
                    }}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: isActive ? "hsl(var(--gold))" : "hsl(var(--foreground)/0.6)" }}>{s.overline}</div>
                    <div className="text-xs font-serif leading-tight">{s.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 h-px" style={{ background: "hsl(var(--line))" }}>
            <div className="h-px transition-all duration-500" style={{ width: `${((stepIndex + 1) / visibleSteps.length) * 100}%`, background: "hsl(var(--gold))" }} />
          </div>
        </div>
      </div>

      {/* Step content + Live preview */}
      <section className="py-12 grid md:grid-cols-12 container-luxe gap-10">
        <div className="md:col-span-8">
          <div className="overline mb-2" style={{ color: "hsl(var(--gold))" }}>{STEPS[step].overline}</div>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tighter mb-2">{STEPS[step].title}</h2>
          <p className="text-foreground/60 text-sm mb-10">{stepInstructions(step)}</p>

          {step === 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {NUTS.map((n) => {
                const active = config.nuts.includes(n.id);
                return (
                  <button key={n.id} onClick={() => toggleNut(n.id)} data-testid={`nut-${n.id}`}
                    className={`group text-left bg-sand p-3 transition relative ${active ? "ring-2 ring-foreground" : ""}`}>
                    <div className="aspect-square overflow-hidden bg-ivory">
                      <img src={n.img} alt={n.name} className="w-full h-full object-cover" />
                    </div>
                    {active && <div className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--gold))" }}><Check size={14} color="white" /></div>}
                    <div className="mt-3">
                      <div className="overline">{n.origin}</div>
                      <div className="font-serif text-lg leading-tight">{n.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {[{ id: "raw", title: "Raw", note: "Pure, untouched, slightly grassy." }, { id: "roasted", title: "Roasted", note: "Deeper, nuttier, caramelised." }].map((o) => (
                <button key={o.id} onClick={() => setConfig((c) => ({ ...c, raw_or_roasted: o.id }))} className={`p-10 text-left bg-sand transition ${config.raw_or_roasted === o.id ? "ring-2 ring-foreground" : ""}`} data-testid={`raw-${o.id}`}>
                  <div className="font-serif text-4xl">{o.title}</div>
                  <p className="text-sm mt-3 text-foreground/70">{o.note}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && config.raw_or_roasted === "roasted" && (
            <div className="grid grid-cols-3 gap-4">
              {[{ l: "light", n: "Subtle, gentle aroma" }, { l: "medium", n: "Balanced and rich" }, { l: "dark", n: "Bold, caramelised" }].map(({ l, n }) => (
                <button key={l} onClick={() => setConfig((c) => ({ ...c, roast_level: l }))} className={`p-6 text-left bg-sand transition ${config.roast_level === l ? "ring-2 ring-foreground" : ""}`} data-testid={`roast-${l}`}>
                  <div className="font-serif text-2xl capitalize">{l}</div>
                  <div className="text-xs text-foreground/60 mt-2">{n}</div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {FLAVORS.map((f) => {
                const active = config.flavors.includes(f.id);
                return (
                  <button key={f.id} onClick={() => toggleFlavor(f.id)} className={`p-5 text-left bg-sand flex justify-between items-start transition ${active ? "ring-2 ring-foreground" : ""}`} data-testid={`flavor-${f.id}`}>
                    <div>
                      <div className="font-serif text-xl">{f.name}</div>
                      <div className="text-xs text-foreground/60 mt-1">{f.note}</div>
                    </div>
                    {active && <Check size={16} style={{ color: "hsl(var(--gold))" }} />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-2 gap-4">
              {[{ id: "smooth", title: "Smooth", note: "Velvet, spreadable, classic." }, { id: "crunchy", title: "Crunchy", note: "With nut chunks, more texture." }].map((o) => (
                <button key={o.id} onClick={() => setConfig((c) => ({ ...c, texture: o.id }))} className={`p-10 text-left bg-sand transition ${config.texture === o.id ? "ring-2 ring-foreground" : ""}`} data-testid={`texture-${o.id}`}>
                  <div className="font-serif text-4xl">{o.title}</div>
                  <p className="text-sm mt-3 text-foreground/70">{o.note}</p>
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-3 gap-4">
              {[{ s: "200g", n: "Tasting size" }, { s: "500g", n: "Family jar" }, { s: "1kg", n: "Atelier reserve" }].map(({ s, n }) => (
                <button key={s} onClick={() => setConfig((c) => ({ ...c, size: s }))} className={`p-8 text-center bg-sand transition ${config.size === s ? "ring-2 ring-foreground" : ""}`} data-testid={`size-${s}`}>
                  <div className="font-serif text-3xl">{s}</div>
                  <div className="text-xs text-foreground/60 mt-2">{n}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step nav */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t" style={{ borderColor: "hsl(var(--line))" }}>
            <button onClick={goPrev} disabled={step === 0} className="btn-ghost disabled:opacity-30 inline-flex items-center gap-1" data-testid="builder-prev">
              <ChevronLeft size={14} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={goNext} disabled={!canAdvance} className="btn-primary disabled:opacity-30 inline-flex items-center gap-1" data-testid="builder-next">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={addToCart} disabled={!pricing} className="btn-primary disabled:opacity-30" data-testid="builder-add-to-cart">
                Add to Cart · {pricing ? formatINR(pricing.price) : "—"}
              </button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <aside className="md:col-span-4">
          <div className="bg-sand p-6 sticky top-[200px]">
            <div className="aspect-square overflow-hidden bg-ivory mb-5">
              <img src="https://images.pexels.com/photos/33657317/pexels-photo-33657317.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="overline mb-2">Your jar</div>
            <div className="font-serif text-2xl leading-tight">
              {config.nuts.length === 0 ? "Begin by choosing a base" : config.nuts.map((n) => n[0].toUpperCase() + n.slice(1)).join(" + ")}
            </div>
            <div className="text-xs text-foreground/70 mt-3 space-y-1.5 leading-relaxed">
              <div className="capitalize">{config.raw_or_roasted}{config.raw_or_roasted === "roasted" ? ` · ${config.roast_level} roast` : ""}</div>
              {config.flavors.length > 0 && <div>+ {config.flavors.join(", ")}</div>}
              <div className="capitalize">{config.texture} · {config.size}</div>
            </div>
            {pricing && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <div className="overline">Live price</div>
                <div className="font-serif text-3xl mt-1" data-testid="builder-live-price">{formatINR(pricing.price)}</div>
                <p className="text-[11px] text-foreground/60 mt-2">Stone-ground to order · ships in 7 days</p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function stepInstructions(step) {
  return [
    "Pick one or more origins. Mix to create a custom blend.",
    "Raw keeps the natural sweetness. Roasted develops nuttier, caramel notes.",
    "Light brings out subtle aromas. Dark goes bolder, more intense.",
    "Optional. Pick none or up to all five — added by hand, in small amounts.",
    "Smooth is classic and spreadable. Crunchy keeps small nut pieces inside.",
    "Choose how much. The 1kg atelier reserve is best value.",
  ][step] || "";
}
