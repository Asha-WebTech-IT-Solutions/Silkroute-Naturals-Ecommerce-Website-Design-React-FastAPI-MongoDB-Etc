import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function AdminCoupons() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, active: true, description: "" });

  const load = () => api.get("/coupons").then((r) => setList(r.data || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/coupons", form);
      toast.success("Coupon created"); load();
      setForm({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, active: true, description: "" });
    } catch (err) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const remove = async (id) => { await api.delete(`/coupons/${id}`); load(); toast.success("Deleted"); };

  return (
    <div data-testid="admin-coupons">
      <div className="overline">Pricing</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Coupons</h1>

      <form onSubmit={create} className="grid grid-cols-6 gap-3 mt-8 p-6 bg-sand">
        <input required className="luxe-input col-span-2" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <select className="luxe-input col-span-1" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
          <option value="percent">% off</option>
          <option value="flat">Flat ₹</option>
        </select>
        <input required type="number" className="luxe-input col-span-1" placeholder="Value" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value || "0") })} />
        <input type="number" className="luxe-input col-span-1" placeholder="Min Order" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: parseFloat(e.target.value || "0") })} />
        <button className="btn-primary col-span-1" data-testid="admin-coupon-create">Create</button>
        <input className="luxe-input col-span-6" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </form>

      <div className="bg-ivory border mt-8" style={{ borderColor: "hsl(var(--line))" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "hsl(var(--background-2))" }}>
            <tr className="text-left"><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Min Order</th><th className="p-4">Description</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: "hsl(var(--line))" }}>
                <td className="p-4 font-mono">{c.code}</td>
                <td className="p-4">{c.discount_type === "percent" ? `${c.discount_value}%` : formatINR(c.discount_value)}</td>
                <td className="p-4">{formatINR(c.min_order)}</td>
                <td className="p-4 text-xs">{c.description}</td>
                <td className="p-4 text-right"><button onClick={() => remove(c.id)} className="p-2 hover:bg-sand"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
