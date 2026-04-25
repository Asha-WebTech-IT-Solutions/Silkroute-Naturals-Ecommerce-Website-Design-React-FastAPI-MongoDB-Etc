import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function AdminBlog() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ slug: "", title: "", excerpt: "", cover_image: "", content: "", author: "Silkroute Editorial" });

  const load = () => api.get("/blog").then((r) => setList(r.data || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/blog", form); toast.success("Published"); load();
      setForm({ slug: "", title: "", excerpt: "", cover_image: "", content: "", author: "Silkroute Editorial" });
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { await api.delete(`/blog/${id}`); toast.success("Deleted"); load(); };

  return (
    <div data-testid="admin-blog">
      <div className="overline">CMS</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Journal</h1>

      <form onSubmit={create} className="grid grid-cols-2 gap-4 mt-8 p-6 bg-sand">
        <input required className="luxe-input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input required className="luxe-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required className="luxe-input col-span-2" placeholder="Cover Image URL" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} />
        <input required className="luxe-input col-span-2" placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        <textarea required className="luxe-input col-span-2 min-h-[120px]" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <input className="luxe-input" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <button className="btn-primary">Publish</button>
      </form>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {list.map((p) => (
          <div key={p.id} className="bg-ivory border p-5 flex gap-4" style={{ borderColor: "hsl(var(--line))" }}>
            <div className="w-24 h-24 bg-sand shrink-0">{p.cover_image && <img src={p.cover_image} alt="" className="w-full h-full object-cover" />}</div>
            <div className="flex-1">
              <div className="font-serif text-lg">{p.title}</div>
              <div className="text-xs text-foreground/60 mt-1">{p.slug}</div>
              <div className="text-xs text-foreground/70 mt-2 line-clamp-2">{p.excerpt}</div>
            </div>
            <button onClick={() => remove(p.id)} className="p-2"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
