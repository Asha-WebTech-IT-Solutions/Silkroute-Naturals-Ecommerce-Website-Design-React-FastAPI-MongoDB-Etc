import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/orders").then((r) => setOrders(r.data || []));
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Status updated"); load();
  };

  return (
    <div data-testid="admin-orders">
      <div className="overline">Sales</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Orders</h1>
      <div className="bg-ivory border mt-8" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "hsl(var(--background-2))" }}>
            <tr className="text-left">
              <th className="p-4">Order #</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t" style={{ borderColor: "hsl(var(--line))" }} data-testid={`admin-order-row`}>
                <td className="p-4 font-mono text-xs">{o.order_number}</td>
                <td className="p-4">
                  <div>{o.user_name}</div>
                  <div className="text-xs text-foreground/60">{o.user_email}</div>
                </td>
                <td className="p-4">{o.items.length}</td>
                <td className="p-4">{formatINR(o.total)}</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => update(o.id, e.target.value)} className="bg-transparent border-b border-line text-xs">
                    {["confirmed", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-xs text-foreground/60">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
