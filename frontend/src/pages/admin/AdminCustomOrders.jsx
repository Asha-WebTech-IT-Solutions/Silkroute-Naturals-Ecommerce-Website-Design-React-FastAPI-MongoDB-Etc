import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";

export default function AdminCustomOrders() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/custom-nut-butter").then((r) => setList(r.data || [])); }, []);

  return (
    <div data-testid="admin-custom-orders">
      <div className="overline">Atelier</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Custom Nut Butter Orders</h1>
      <div className="bg-ivory border mt-8" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "hsl(var(--background-2))" }}>
            <tr className="text-left"><th className="p-4">Configuration</th><th className="p-4">Size</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4">Date</th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <td className="p-4">
                  <div className="font-serif">{c.nuts.join(" + ")}</div>
                  <div className="text-xs text-foreground/60">{c.raw_or_roasted}{c.roast_level ? ` · ${c.roast_level}` : ""} · {c.texture}{c.flavors?.length ? ` · ${c.flavors.join(", ")}` : ""}</div>
                </td>
                <td className="p-4">{c.size}</td>
                <td className="p-4">{formatINR(c.price)}</td>
                <td className="p-4 overline" style={{ color: "hsl(var(--gold))" }}>{c.status}</td>
                <td className="p-4 text-xs text-foreground/60">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
