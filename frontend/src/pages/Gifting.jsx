import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSEO } from "@/lib/seo";

export default function Gifting() {
  useSEO({ title: "Corporate Gifting", description: "Hand-assembled gift boxes from 10 single-origin SKUs. Diwali, weddings, year-end. Pan-India delivery.", image: "/product-lineup.jpg" });
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", quantity: 50, budget: 50000, occasion: "Diwali", message: "" });
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/gifting-inquiries", form);
      setDone(true); toast.success("Inquiry received");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div data-testid="gifting-page">
      <section className="relative h-[60vh] grain overflow-hidden">
        <img src="/product-lineup.jpg" alt="Silkroute Naturals, gift box product lineup" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--background)/0.3), hsl(var(--background)/0.95))" }} />
        <div className="container-luxe relative h-full flex flex-col justify-end pb-16">
          <div className="overline mb-4">Corporate · Festive · Bespoke</div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none max-w-3xl">Gifts that travel well.</h1>
        </div>
      </section>

      <section className="section-pad container-luxe grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="overline mb-3">Why us</div>
          <h2 className="font-serif text-4xl">Hand-assembled. Letterpress note. White-glove delivery.</h2>
          <ul className="mt-8 space-y-4 text-foreground/80">
            <li><span style={{ color: "hsl(var(--gold))" }} className="mr-2">·</span>Custom assortments from 10 single-origin SKUs</li>
            <li><span style={{ color: "hsl(var(--gold))" }} className="mr-2">·</span>Branded packaging, embossed seals, ribbon</li>
            <li><span style={{ color: "hsl(var(--gold))" }} className="mr-2">·</span>Pan-India delivery in 5 working days</li>
            <li><span style={{ color: "hsl(var(--gold))" }} className="mr-2">·</span>Minimum 25 boxes · Volume rates</li>
          </ul>
          <div className="mt-12 grid grid-cols-2 gap-3">
            <div className="img-zoom aspect-square"><img src="/product-detail.jpg" alt="" className="w-full h-full object-cover" /></div>
            <div className="img-zoom aspect-square"><img src="/store-detail-2.jpg" alt="" className="w-full h-full object-cover" /></div>
          </div>
        </div>

        <div className="md:col-span-7">
          {done ? (
            <div className="p-12 text-center" style={{ background: "hsl(var(--background-2))" }} data-testid="gifting-success">
              <div className="font-serif text-3xl">Thank you.</div>
              <p className="mt-3 text-foreground/70">Our gifting team will be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid grid-cols-2 gap-x-6 gap-y-5 p-8" style={{ background: "hsl(var(--background-2))" }} data-testid="gifting-form">
              <div className="col-span-2 overline">Bulk Inquiry</div>
              <input required className="luxe-input col-span-2" placeholder="Company / Brand" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} data-testid="gifting-company" />
              <input required className="luxe-input col-span-1" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="gifting-name" />
              <input required className="luxe-input col-span-1" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="gifting-phone" />
              <input required type="email" className="luxe-input col-span-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="gifting-email" />
              <input required type="number" className="luxe-input col-span-1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value || "0") })} data-testid="gifting-qty" />
              <input type="number" className="luxe-input col-span-1" placeholder="Budget (₹)" value={form.budget} onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value || "0") })} data-testid="gifting-budget" />
              <select className="luxe-input col-span-2" value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} data-testid="gifting-occasion">
                {["Diwali", "Wedding", "Onboarding", "Year-end", "Other"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <textarea className="luxe-input col-span-2 min-h-[100px]" placeholder="Tell us about your gifting vision" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button className="btn-primary col-span-2 mt-2" data-testid="gifting-submit">Submit Inquiry</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
