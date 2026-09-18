import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminOverview() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/admin/analytics").then((r) => setData(r.data)); }, []);

  if (!data) return <div className="text-foreground/60">Loading analytics...</div>;

  const cards = [
    { label: "Revenue", value: formatINR(data.total_revenue) },
    { label: "Orders", value: data.total_orders },
    { label: "Customers", value: data.total_customers },
    { label: "Products", value: data.total_products },
  ];

  return (
    <div data-testid="admin-overview">
      <div className="overline">Dashboard</div>
      <h1 className="font-serif text-4xl tracking-tighter mt-2">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-10" style={{ background: "hsl(var(--line))" }}>
        {cards.map((c) => (
          <div key={c.label} className="bg-ivory p-6">
            <div className="overline">{c.label}</div>
            <div className="font-serif text-3xl mt-2" data-testid={`stat-${c.label.toLowerCase()}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-ivory border p-6" style={{ borderColor: "hsl(var(--line))" }}>
          <div className="overline mb-2">Last 14 days</div>
          <h3 className="font-serif text-2xl mb-4">Revenue trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.by_day}>
              <CartesianGrid stroke="hsl(var(--line))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--gold))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-ivory border p-6" style={{ borderColor: "hsl(var(--line))" }}>
          <div className="overline mb-2">Top products</div>
          <h3 className="font-serif text-2xl mb-4">By quantity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.top_products}>
              <CartesianGrid stroke="hsl(var(--line))" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="qty" fill="hsl(var(--gold))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
