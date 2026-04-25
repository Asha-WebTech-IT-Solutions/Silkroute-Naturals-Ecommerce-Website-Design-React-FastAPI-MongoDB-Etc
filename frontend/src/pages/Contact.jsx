import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
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
    <div data-testid="contact-page" className="section-pad">
      <div className="container-luxe grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="overline mb-3">Stay in touch</div>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tighter leading-none">Contact.</h1>
          <div className="mt-10 space-y-6 text-sm leading-relaxed">
            <div>
              <div className="overline mb-2">Atelier</div>
              <p>Silkroute Naturals Experience Center<br/>100 Ft Road, Indiranagar<br/>Bengaluru — 560038</p>
            </div>
            <div>
              <div className="overline mb-2">Telephone</div>
              <p>+91 7406 995 999</p>
            </div>
            <div>
              <div className="overline mb-2">Email</div>
              <p>hello@silkroutenaturals.com</p>
            </div>
            <div>
              <div className="overline mb-2">Hours</div>
              <p>Tuesday — Sunday<br/>11:00 — 20:00</p>
            </div>
          </div>
          <div className="mt-10 aspect-[4/3] overflow-hidden">
            <iframe
              title="map"
              src="https://www.google.com/maps?q=Indiranagar+Bengaluru&output=embed"
              className="w-full h-full border-0 grayscale"
            />
          </div>
        </div>

        <div className="md:col-span-7 md:pl-12">
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
              <textarea required className="luxe-input min-h-[140px]" placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" />
              <button className="btn-primary" data-testid="contact-submit">Send</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
