import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Search } from "lucide-react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";

export default function SearchModal({ open, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); return; }
    const t = setTimeout(() => {
      if (!q.trim()) { setResults([]); return; }
      api.get(`/products?search=${encodeURIComponent(q)}`).then((r) => setResults((r.data || []).slice(0, 8)));
    }, 200);
    return () => clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" data-testid="search-modal">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute top-0 left-0 right-0 bg-ivory" style={{ borderBottom: "1px solid hsl(var(--line))" }}>
        <div className="container-luxe py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="overline">Search the collection</div>
            <button onClick={onClose} aria-label="close" data-testid="search-close"><X size={20} /></button>
          </div>
          <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: "hsl(var(--line-strong))" }}>
            <Search size={20} className="text-foreground/60" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Almonds, saffron, Iran..."
              className="flex-1 bg-transparent outline-none text-2xl md:text-3xl font-serif tracking-tight"
              data-testid="search-input"
            />
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-x-8 gap-y-3 max-h-[60vh] overflow-y-auto">
            {results.length === 0 && q.trim() && (
              <div className="text-foreground/60 text-sm col-span-2 py-8">No matches. Try another origin or category.</div>
            )}
            {!q.trim() && (
              <div className="col-span-2 text-sm text-foreground/60">
                <div className="overline mb-3">Popular</div>
                <div className="flex flex-wrap gap-2">
                  {["Mamra", "Pistachio", "Saffron", "Medjool", "Hazelnut"].map((s) => (
                    <button key={s} onClick={() => setQ(s)} className="px-3 py-1.5 border text-xs uppercase tracking-widest hover:bg-sand" style={{ borderColor: "hsl(var(--line))" }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {results.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-4 py-3 border-b hover:bg-sand/40" style={{ borderColor: "hsl(var(--line))" }} data-testid={`search-result-${p.slug}`}>
                <div className="w-14 h-16 bg-sand shrink-0">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                <div className="flex-1">
                  <div className="overline text-[10px]">{p.origin}</div>
                  <div className="font-serif text-lg leading-tight">{p.name}</div>
                </div>
                <div className="text-sm">{formatINR(p.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
