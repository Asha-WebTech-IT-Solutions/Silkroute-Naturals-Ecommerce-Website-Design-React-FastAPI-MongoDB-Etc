import { useSEO } from "@/lib/seo";

export default function OurStory() {
  useSEO({ title: "Our Story", description: "A 2,000-year-old harvest, carried with care. The Silk Route narrative behind Silk Route Naturals.", image: "https://images.pexels.com/photos/9494903/pexels-photo-9494903.jpeg" });
  const stops = [
    { country: "Afghanistan", img: "https://images.unsplash.com/photo-1633677491262-0a51b9851f46", text: "From the orchards of Kunduz, the Mamra almond. Denser, oilier, intensely fragrant. The almond of Persian poetry." },
    { country: "Iran", img: "https://images.pexels.com/photos/34746904/pexels-photo-34746904.jpeg", text: "Rafsanjan has grown pistachios for 1,500 years. We bring in only the Akbari grade. Large, naturally split, emerald inside." },
    { country: "Turkey", img: "https://images.pexels.com/photos/5425018/pexels-photo-5425018.jpeg", text: "The Black Sea coast grows the world's hazelnut. Slow-roasted to amber, skinned by hand." },
    { country: "Morocco", img: "https://images.unsplash.com/photo-1708335008926-e8b898da2ae9", text: "Tafilalet, once a caravan stop on the trans-Saharan route, still grows some of the softest Medjool dates." },
    { country: "India", img: "https://images.pexels.com/photos/9494903/pexels-photo-9494903.jpeg", text: "Kashmiri Mongra saffron from the Pampore plateau. By weight, more valuable than gold." },
  ];

  return (
    <div data-testid="our-story-page">
      <section className="relative h-[70vh] grain overflow-hidden" style={{ background: "hsl(var(--background-2))" }}>
        <img src="https://images.pexels.com/photos/8465992/pexels-photo-8465992.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background-2)/0.5) 0%, hsl(var(--background-2)/0.95) 100%)" }} />
        <div className="container-luxe relative h-full flex flex-col justify-end pb-20">
          <div className="overline mb-4">Our story</div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[96px] tracking-tighter leading-none max-w-4xl">A harvest carried with care, for 2,000 years.</h1>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-luxe max-w-3xl">
          <p className="font-serif text-2xl md:text-3xl leading-snug">
            Silk Route Naturals began with a simple question. What if the dry fruit on our table could still taste of the place it came from?
          </p>
          <div className="mt-12 space-y-8 text-foreground/80 leading-loose text-lg">
            <p>The Silk Route was never a single road. It was a network of caravans, stone bridges, oases, mountain passes. Almonds travelled west. Saffron travelled east. Hazelnuts went to Rome, dates to Damascus, walnuts to Persepolis.</p>
            <p>For centuries, what arrived on a wealthy table was a journey, not a snack. Each fruit carried the soil, the climate, the hand of its farmer.</p>
            <p>We spent years walking those routes again. Listening to growers in Kunduz, Rafsanjan, Erbaa, Tafilalet, Pampore. We import in small lots. We keep things unprocessed. Nothing bleached, nothing polished, nothing rushed.</p>
            <p>The result is a pantry that looks less like a supermarket shelf and more like a memory. Closer to how our grandmothers served these nuts, and how traders once carried them across continents.</p>
            <p style={{ color: "hsl(var(--gold))" }} className="font-serif text-2xl italic">What was once paid for in silk, we now offer with care.</p>
          </div>
        </div>
      </section>

      {/* Stops */}
      <section className="space-y-32 pb-32">
        {stops.map((s, i) => (
          <div key={s.country} className="container-luxe grid md:grid-cols-12 gap-10 items-center fade-up" data-testid={`story-stop-${s.country}`}>
            <div className={`md:col-span-7 img-zoom ${i % 2 ? "md:order-2" : ""}`}>
              <img src={s.img} alt={s.country} className="w-full aspect-[4/3] object-cover" />
            </div>
            <div className="md:col-span-5">
              <div className="overline">Stop {i + 1}</div>
              <h2 className="font-serif text-5xl md:text-6xl tracking-tighter mt-3 leading-none">{s.country}.</h2>
              <p className="mt-6 text-foreground/75 leading-relaxed">{s.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
