import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSEO } from "@/lib/seo";

export default function ExperienceCenter() {
  useSEO({ title: "Experience Center — Indiranagar", description: "Reserve a tasting flight, atelier tour or private workshop at our Bengaluru Experience Center.", image: "https://images.pexels.com/photos/35045845/pexels-photo-35045845.jpeg" });
  const [form, setForm] = useState({
    name: "", email: "", phone: "", visit_date: "", visit_time: "11:00", party_size: 2, experience_type: "tasting", notes: "",
  });
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bookings", form);
      setDone(true); toast.success("Booking received");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div data-testid="experience-center-page">
      <section className="relative h-[70vh] grain overflow-hidden">
        <img src="https://images.pexels.com/photos/35045845/pexels-photo-35045845.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background)/0.2), hsl(var(--background)/0.95))" }} />
        <div className="container-luxe relative h-full flex flex-col justify-end pb-16">
          <div className="overline mb-4">Indiranagar · Bengaluru</div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none max-w-4xl">The Experience Center.</h1>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-luxe grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="overline mb-3">A quiet room</div>
            <h2 className="font-serif text-4xl tracking-tight leading-tight">Cold-press oils. Fresh nut butters. Tasting flights.</h2>
            <p className="mt-6 text-foreground/75 leading-relaxed">
              Step inside our atelier in Indiranagar. Watch the cold-press oil mill in motion. Build your own nut butter on our stone-grinder. Taste five origins side by side.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              <li><span style={{ color: "hsl(var(--gold))" }}>—</span> Cold-press oil mill (almond, sesame, walnut)</li>
              <li><span style={{ color: "hsl(var(--gold))" }}>—</span> Stone-ground nut butter station</li>
              <li><span style={{ color: "hsl(var(--gold))" }}>—</span> Curated tasting flight · 5 origins · 50 mins</li>
              <li><span style={{ color: "hsl(var(--gold))" }}>—</span> Private workshops on request</li>
            </ul>
          </div>

          <div className="md:col-span-7">
            {done ? (
              <div className="p-12 text-center" style={{ background: "hsl(var(--background-2))" }} data-testid="booking-success">
                <div className="font-serif text-3xl">Thank you.</div>
                <p className="mt-3 text-foreground/70">We'll confirm your visit shortly. Watch your inbox.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid grid-cols-2 gap-x-6 gap-y-5 p-8" style={{ background: "hsl(var(--background-2))" }} data-testid="booking-form">
                <div className="col-span-2 overline">Reserve a visit</div>
                <input required className="luxe-input col-span-1" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="booking-name" />
                <input required className="luxe-input col-span-1" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="booking-phone" />
                <input required type="email" className="luxe-input col-span-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="booking-email" />
                <input required type="date" className="luxe-input col-span-1" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} data-testid="booking-date" />
                <input required type="time" className="luxe-input col-span-1" value={form.visit_time} onChange={(e) => setForm({ ...form, visit_time: e.target.value })} data-testid="booking-time" />
                <select className="luxe-input col-span-1" value={form.experience_type} onChange={(e) => setForm({ ...form, experience_type: e.target.value })} data-testid="booking-type">
                  <option value="tasting">Tasting Flight</option>
                  <option value="tour">Atelier Tour</option>
                  <option value="workshop">Private Workshop</option>
                </select>
                <input type="number" min={1} max={10} className="luxe-input col-span-1" placeholder="Party Size" value={form.party_size} onChange={(e) => setForm({ ...form, party_size: parseInt(e.target.value || "1") })} data-testid="booking-party" />
                <textarea className="luxe-input col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <button className="btn-primary col-span-2 mt-2" data-testid="booking-submit">Reserve</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-px" style={{ background: "hsl(var(--line-strong))" }}>
        {["https://images.unsplash.com/photo-1769697064243-889f2e25d44a","https://images.unsplash.com/photo-1775021723698-b9afeaa084d1","https://images.pexels.com/photos/35045845/pexels-photo-35045845.jpeg"].map((src,i)=>(
          <div key={i} className="img-zoom aspect-[4/5] bg-ivory"><img src={src} alt="" className="w-full h-full object-cover" /></div>
        ))}
      </section>
    </div>
  );
}
