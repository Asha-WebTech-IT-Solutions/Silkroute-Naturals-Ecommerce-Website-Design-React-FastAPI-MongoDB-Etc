import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";

export default function AdminGifting() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/gifting-inquiries").then((r) => setList(r.data || [])); }, []);
  return (
    <div data-testid="admin-gifting">
      <div className="overline">Bulk</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Gifting Inquiries</h1>
      <div className="bg-ivory border mt-8" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "hsl(var(--background-2))" }}>
            <tr className="text-left"><th className="p-4">Company</th><th className="p-4">Contact</th><th className="p-4">Qty</th><th className="p-4">Budget</th><th className="p-4">Occasion</th></tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.id} className="border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <td className="p-4 font-serif">{g.company}</td>
                <td className="p-4"><div>{g.name}</div><div className="text-xs text-foreground/60">{g.email} · {g.phone}</div></td>
                <td className="p-4">{g.quantity}</td>
                <td className="p-4">{g.budget ? formatINR(g.budget) : "-"}</td>
                <td className="p-4">{g.occasion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
