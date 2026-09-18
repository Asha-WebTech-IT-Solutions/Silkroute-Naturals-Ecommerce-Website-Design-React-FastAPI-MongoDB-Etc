import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSEO } from "@/lib/seo";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  useSEO({ title: "Contact", description: "Reach our atelier in Indiranagar, Bengaluru. +91 7406 995 999. hello@silkroutenaturals.com" });
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/contact", form);
      setDone(true); toast.success("Message sent");
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  return (
    <div data-testid="contact-page">
      {/* Hero strip */}
      <section className="py-20 border-b" style={{ borderColor: "hsl(var(--line))", background: "hsl(var(--background-2))" }}>
        <div className="container-luxe">
          <div className="overline mb-4">Stay in touch</div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none">Contact.</h1>
          <p className="mt-6 max-w-md text-foreground/70">We'd love to hear from you, about an order, a private tasting, a custom gift, or simply to talk dry fruits.</p>
        </div>
      </section>

      {/* Info + Form */}
      <section className="section-pad">
        <div className="container-luxe grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-8">
            <ContactBlock icon={MapPin} label="Atelier">
              Silkroute Naturals Experience Center<br/>
              100 Ft Road, Indiranagar<br/>
              Bengaluru, 560038
            </ContactBlock>
            <ContactBlock icon={Phone} label="Telephone">+91 7406 995 999</ContactBlock>
            <ContactBlock icon={Mail} label="Email">hello@silkroutenaturals.com</ContactBlock>
            <ContactBlock icon={Clock} label="Hours">
              Tuesday to Sunday<br/>
              11:00 to 20:00<br/>
              <span className="text-foreground/50">Closed Mondays</span>
            </ContactBlock>
          </div>

          <div className="md:col-span-7">
            {done ? (
              <div className="p-12 text-center" style={{ background: "hsl(var(--background-2))" }} data-testid="contact-success">
                <div className="font-serif text-3xl">Thank you.</div>
                <p className="mt-3 text-foreground/70">We'll respond within one business day.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6 p-8" style={{ background: "hsl(var(--background-2))" }} data-testid="contact-form">
                <div className="overline">Send a message</div>
                <input required className="luxe-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" />
                <input required type="email" className="luxe-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" />
                <input className="luxe-input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="contact-phone" />
                <textarea required className="luxe-input min-h-[160px]" placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" />
                <button className="btn-primary" data-testid="contact-submit">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Full-width map */}
      <section className="border-t" style={{ borderColor: "hsl(var(--line))" }} data-testid="contact-map-section">
        <div className="container-luxe py-12 text-center">
          <div className="overline mb-3">Find us</div>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tighter">100 Ft Road, Indiranagar.</h2>
        </div>
        <div className="w-full h-[60vh] grayscale-[40%]">
          <iframe
            title="Silkroute Naturals, Indiranagar Atelier"
            src="https://www.google.com/maps?q=100+Feet+Road+Indiranagar+Bengaluru&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}

function ContactBlock({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="overline mb-2 inline-flex items-center gap-2"><Icon size={12} style={{ color: "hsl(var(--gold))" }} /> {label}</div>
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}
