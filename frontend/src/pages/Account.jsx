import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useSEO } from "@/lib/seo";

export default function Account() {
  useSEO({ title: "Account" });
  const { user, ready, logout } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) api.get("/orders/mine").then((r) => setOrders(r.data || []));
  }, [user]);

  if (!ready) return <div className="container-luxe py-32 text-foreground/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="section-pad container-luxe" data-testid="account-page">
      <div className="grid md:grid-cols-12 gap-10">
        <aside className="md:col-span-4">
          <div className="overline mb-2">Account</div>
          <div className="font-serif text-4xl tracking-tight" data-testid="account-name">{user.name}</div>
          <div className="text-sm text-foreground/60 mt-1">{user.email}</div>
          <div className="text-sm text-foreground/60">{user.phone}</div>
          <button onClick={async () => { await logout(); nav("/"); }} className="btn-ghost mt-8" data-testid="logout-button">Sign Out</button>
          {user.role === "admin" && (
            <Link to="/admin" className="btn-primary mt-4 inline-flex" data-testid="account-admin-link">Admin Panel →</Link>
          )}
        </aside>

        <section className="md:col-span-8">
          <div className="overline mb-3">Order history</div>
          <h2 className="font-serif text-4xl">Your orders</h2>
          <div className="mt-8 space-y-4">
            {orders.length === 0 && <p className="text-foreground/60">No orders yet. <Link to="/shop" className="hover-underline">Begin →</Link></p>}
            {orders.map((o) => (
              <div key={o.id} className="p-6 border" style={{ borderColor: "hsl(var(--line))" }} data-testid={`order-${o.order_number}`}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="overline">#{o.order_number}</div>
                    <div className="text-xs text-foreground/60 mt-1">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-2xl">{formatINR(o.total)}</div>
                    <div className="overline" style={{ color: "hsl(var(--gold))" }}>{o.status}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3 flex-wrap">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-12 h-14 bg-sand">{it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}</div>
                      <div>
                        <div>{it.name}</div>
                        <div className="text-xs text-foreground/60">× {it.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
