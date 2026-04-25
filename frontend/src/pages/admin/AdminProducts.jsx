import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

const EMPTY = {
  slug: "", name: "", origin: "", category: "", tagline: "", description: "",
  benefits: [], price: 0, compare_at_price: 0, weight: "", stock: 0, images: [],
  featured: false, story: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/products").then((r) => setProducts(r.data || []));
  useEffect(() => { load(); }, []);

  const open = (p = null) => {
    setEditing(p);
    setForm(p ? { ...EMPTY, ...p } : EMPTY);
  };
  const close = () => { setEditing(null); setForm(EMPTY); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null, stock: Number(form.stock), benefits: typeof form.benefits === "string" ? form.benefits.split("\n").filter(Boolean) : form.benefits, images: typeof form.images === "string" ? form.images.split("\n").filter(Boolean) : form.images };
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Updated" : "Created");
      close(); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Deleted"); load();
  };

  return (
    <div data-testid="admin-products">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="overline">Catalogue</div>
          <h1 className="font-serif text-4xl tracking-tighter mt-2">Products</h1>
        </div>
        <button onClick={() => open()} className="btn-primary inline-flex" data-testid="admin-add-product"><Plus size={14} /> New Product</button>
      </div>

      <div className="bg-ivory border" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead className="text-left" style={{ background: "hsl(var(--background-2))" }}>
            <tr>
              <th className="p-4">Product</th><th className="p-4">Origin</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: "hsl(var(--line))" }} data-testid={`admin-product-row-${p.slug}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-sand">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                    <div>
                      <div className="font-serif text-base">{p.name}</div>
                      <div className="text-xs text-foreground/60">{p.weight}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">{p.origin}</td>
                <td className="p-4">{formatINR(p.price)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4 text-right">
                  <button onClick={() => open(p)} className="p-2 hover:bg-sand"><Pencil size={14} /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-sand"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing !== null || form !== EMPTY) && form !== EMPTY && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-ivory w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">{editing ? "Edit Product" : "New Product"}</h2>
              <button onClick={close}><X size={20} /></button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-2 gap-x-5 gap-y-4">
              <input required className="luxe-input col-span-1" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <input required className="luxe-input col-span-1" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required className="luxe-input col-span-1" placeholder="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
              <input required className="luxe-input col-span-1" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input required className="luxe-input col-span-2" placeholder="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              <textarea required className="luxe-input col-span-2 min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input required type="number" className="luxe-input col-span-1" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input type="number" className="luxe-input col-span-1" placeholder="Compare-at price" value={form.compare_at_price || ""} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
              <input required className="luxe-input col-span-1" placeholder="Weight (e.g. 250g)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              <input required type="number" className="luxe-input col-span-1" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <textarea className="luxe-input col-span-2 min-h-[60px]" placeholder="Benefits (one per line)" value={Array.isArray(form.benefits) ? form.benefits.join("\n") : form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
              <textarea className="luxe-input col-span-2 min-h-[60px]" placeholder="Image URLs (one per line)" value={Array.isArray(form.images) ? form.images.join("\n") : form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              <input className="luxe-input col-span-2" placeholder="Origin story (one line)" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
              <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on home</label>
              <button className="btn-primary col-span-2" data-testid="admin-product-save">{editing ? "Save Changes" : "Create Product"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
