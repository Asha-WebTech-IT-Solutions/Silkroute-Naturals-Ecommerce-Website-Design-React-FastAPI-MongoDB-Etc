import { Link, NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/custom-orders", label: "Custom Orders" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/gifting", label: "Gifting" },
  { to: "/admin/blog", label: "Journal" },
  { to: "/admin/banners", label: "Banners" },
];

export default function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const nav = useNavigate();

  if (!ready) return <div className="p-12">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/account" replace />;

  return (
    <div className="min-h-screen flex bg-ivory" data-testid="admin-layout">
      <aside className="w-60 border-r" style={{ borderColor: "hsl(var(--line))", background: "hsl(var(--background))" }}>
        <div className="p-6 border-b" style={{ borderColor: "hsl(var(--line))" }}>
          <Link to="/" className="block">
            <img src="/silkroute-logo.png" alt="Silkroute Naturals" className="h-12 w-auto" />
            <div className="overline mt-2">Admin Atelier</div>
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {ADMIN_NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`admin-nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm tracking-wide ${isActive ? "bg-foreground text-ivory" : "hover:bg-sand"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 mt-6 border-t" style={{ borderColor: "hsl(var(--line))" }}>
          <div className="text-xs text-foreground/60">{user.email}</div>
          <button onClick={async () => { await logout(); nav("/"); }} className="btn-ghost mt-3 w-full text-xs" data-testid="admin-logout">Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
