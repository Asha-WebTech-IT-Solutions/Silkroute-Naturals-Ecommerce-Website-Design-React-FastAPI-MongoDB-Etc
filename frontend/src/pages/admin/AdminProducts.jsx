import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload } from "lucide-react";

const EMPTY = {
  slug: "", name: "", origin: "", category: "almonds", tagline: "", description: "",
  benefits: "", price: 0, compare_at_price: "", weight: "", stock: 0, images: [],
  featured: false, story: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => api.get("/products").then((r) => setProducts(r.data || []));
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...EMPTY,
      ...p,
      benefits: Array.isArray(p.benefits) ? p.benefits.join("\n") : (p.benefits || ""),
      compare_at_price: p.compare_at_price || "",
      images: Array.isArray(p.images) ? p.images : [],
    });
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditing(null); setForm({ ...EMPTY }); };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newImages = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/uploads/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
        newImages.push(data.url);
      }
      setForm((f) => ({ ...f, images: [...(f.images || []), ...newImages] }));
      toast.success(`${newImages.length} image${newImages.length > 1 ? "s" : ""} uploaded`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        origin: form.origin.trim(),
        category: form.category.trim(),
        tagline: form.tagline.trim(),
        description: form.description,
        benefits: typeof form.benefits === "string"
          ? form.benefits.split("\n").map((s) => s.trim()).filter(Boolean)
          : (form.benefits || []),
        price: Number(form.price) || 0,
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        weight: form.weight,
        stock: Number(form.stock) || 0,
        images: Array.isArray(form.images) ? form.images : [],
        featured: !!form.featured,
        story: form.story || "",
      };
      if (!payload.slug || !payload.name || !payload.origin || !payload.category || !payload.weight) {
        toast.error("Please fill slug, name, origin, category and weight");
        return;
      }
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Product updated" : "Product created");
      close();
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed, check fields");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div data-testid="admin-products">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="overline">Catalogue</div>
          <h1 className="font-serif text-4xl tracking-tighter mt-2">Products</h1>
        </div>
        <button onClick={openNew} className="btn-primary inline-flex" data-testid="admin-add-product">
          <Plus size={14} className="mr-1" /> New Product
        </button>
      </div>

      <div className="bg-ivory border" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead className="text-left" style={{ background: "hsl(var(--background-2))" }}>
            <tr>
              <th className="p-4">Product</th><th className="p-4">Origin</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4 text-right">Actions</th>
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
                      <div className="text-xs text-foreground/60">{p.weight} · {p.featured ? "Featured" : "-"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">{p.origin}</td>
                <td className="p-4">{formatINR(p.price)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-sand" data-testid={`admin-edit-${p.slug}`}><Pencil size={14} /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-sand" data-testid={`admin-delete-${p.slug}`}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={close} data-testid="admin-product-modal">
          <div className="bg-ivory w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-ivory" style={{ borderColor: "hsl(var(--line))" }}>
              <h2 className="font-serif text-2xl">{editing ? "Edit Product" : "New Product"}</h2>
              <button onClick={close} aria-label="close" data-testid="admin-product-close"><X size={20} /></button>
            </div>
            <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-x-5 gap-y-4">
              {/* Image upload */}
              <div className="col-span-2">
                <div className="overline mb-2">Images</div>
                <div className="grid grid-cols-4 gap-3">
                  {form.images.map((src, i) => (
                    <div key={i} className="relative group bg-sand aspect-square">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100" aria-label="remove image">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="border-2 border-dashed flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-sand/50" style={{ borderColor: "hsl(var(--line-strong))" }}>
                    <Upload size={20} className="text-foreground/50 mb-1" />
                    <span className="text-[10px] uppercase tracking-widest text-foreground/60">{uploading ? "Uploading..." : "Upload"}</span>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleUpload(e.target.files)}
                      className="hidden"
                      data-testid="admin-product-upload"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-foreground/60 mt-2">Upload up to 5MB per image. PNG, JPG, WEBP supported.</p>
              </div>

              <Field label="Name" required>
                <input className="luxe-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} data-testid="admin-product-name" />
              </Field>
              <Field label="Slug" required>
                <input className="luxe-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} data-testid="admin-product-slug" />
              </Field>
              <Field label="Origin" required>
                <select className="luxe-input" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} data-testid="admin-product-origin">
                  <option value="">Select…</option>
                  {["Afghanistan", "Iran", "Turkey", "India", "Morocco", "Other"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Category" required>
                <select className="luxe-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="admin-product-category">
                  {["almonds","cashews","pistachios","hazelnuts","walnuts","dates","spices","dried-fruits","oils","elixirs","other"].map((o) => <option key={o} value={o}>{o.replace("-", " ")}</option>)}
                </select>
              </Field>
              <Field label="Price (₹)" required>
                <input type="number" min="0" step="1" className="luxe-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="admin-product-price" />
              </Field>
              <Field label="Compare-at price (optional)">
                <input type="number" min="0" step="1" className="luxe-input" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
              </Field>
              <Field label="Weight (e.g. 250g)" required>
                <input className="luxe-input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} data-testid="admin-product-weight" />
              </Field>
              <Field label="Stock" required>
                <input type="number" min="0" step="1" className="luxe-input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} data-testid="admin-product-stock" />
              </Field>
              <Field label="Tagline" full>
                <input className="luxe-input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="One-line poetic description" />
              </Field>
              <Field label="Description" full>
                <textarea className="luxe-input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <Field label="Benefits, one per line" full>
                <textarea className="luxe-input min-h-[80px]" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder={"Hand-graded\nSingle-origin\nNo preservatives"} />
              </Field>
              <Field label="Origin story (one line)" full>
                <input className="luxe-input" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
              </Field>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} data-testid="admin-product-featured" />
                Featured on home page
              </label>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={close} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" data-testid="admin-product-save">{editing ? "Save Changes" : "Create Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, full, children }) {
  return (
    <div className={full ? "col-span-2" : "col-span-1"}>
      <label className="text-[11px] uppercase tracking-widest text-foreground/60 mb-1 block">{label}{required && <span style={{ color: "hsl(var(--gold))" }}> *</span>}</label>
      {children}
    </div>
  );
}
