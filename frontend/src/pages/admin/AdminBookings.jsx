import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AdminBookings() {
  const [list, setList] = useState([]);
  const load = () => api.get("/bookings").then((r) => setList(r.data || []));
  useEffect(() => { load(); }, []);
  const update = async (id, status) => { await api.put(`/bookings/${id}/status`, { status }); toast.success("Updated"); load(); };

  return (
    <div data-testid="admin-bookings">
      <div className="overline">Experience</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Bookings</h1>
      <div className="bg-ivory border mt-8" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "hsl(var(--background-2))" }}>
            <tr className="text-left"><th className="p-4">Guest</th><th className="p-4">Type</th><th className="p-4">Date / Time</th><th className="p-4">Party</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id} className="border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <td className="p-4">
                  <div className="font-serif">{b.name}</div>
                  <div className="text-xs text-foreground/60">{b.email} · {b.phone}</div>
                </td>
                <td className="p-4">{b.experience_type}</td>
                <td className="p-4">{b.visit_date} · {b.visit_time}</td>
                <td className="p-4">{b.party_size}</td>
                <td className="p-4">
                  <select value={b.status} onChange={(e) => update(b.id, e.target.value)} className="bg-transparent border-b border-line text-xs">
                    {["pending", "confirmed", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
