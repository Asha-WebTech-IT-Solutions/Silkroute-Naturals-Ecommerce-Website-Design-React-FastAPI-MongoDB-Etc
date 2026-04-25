import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function AdminBanners() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", cta_label: "", cta_link: "", image: "", active: true });

  const load = () => api.get("/banners/all").then((r) => setList(r.data || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/banners", form); toast.success("Banner saved"); load();
      setForm({ title: "", subtitle: "", cta_label: "", cta_link: "", image: "", active: true });
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { await api.delete(`/banners/${id}`); load(); toast.success("Deleted"); };

  return (
    <div data-testid="admin-banners">
      <div className="overline">Storefront</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Banners</h1>

      <form onSubmit={create} className="grid grid-cols-2 gap-4 mt-8 p-6 bg-sand">
        <input required className="luxe-input col-span-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required className="luxe-input col-span-2" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <input required className="luxe-input" placeholder="CTA label" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} />
        <input required className="luxe-input" placeholder="CTA link" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} />
        <input required className="luxe-input col-span-2" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
        <button className="btn-primary">Add Banner</button>
      </form>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {list.map((b) => (
          <div key={b.id} className="bg-ivory border" style={{ borderColor: "hsl(var(--line))" }}>
            <div className="aspect-[2/1] bg-sand">{b.image && <img src={b.image} alt="" className="w-full h-full object-cover" />}</div>
            <div className="p-5 flex justify-between items-start">
              <div>
                <div className="font-serif text-lg">{b.title}</div>
                <div className="text-xs text-foreground/70 mt-1">{b.subtitle}</div>
                <div className="overline mt-2" style={{ color: b.active ? "hsl(var(--success))" : undefined }}>{b.active ? "Active" : "Inactive"}</div>
              </div>
              <button onClick={() => remove(b.id)} className="p-2"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
