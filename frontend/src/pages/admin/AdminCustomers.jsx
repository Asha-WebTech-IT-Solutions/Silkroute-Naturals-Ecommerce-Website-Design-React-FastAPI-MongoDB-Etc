import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminCustomers() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/customers").then((r) => setList(r.data || [])); }, []);
  return (
    <div data-testid="admin-customers">
      <div className="overline">CRM</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Customers</h1>
      <div className="bg-ivory border mt-8" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "hsl(var(--background-2))" }}>
            <tr className="text-left"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Joined</th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <td className="p-4 font-serif">{c.name}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4 text-xs text-foreground/60">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
