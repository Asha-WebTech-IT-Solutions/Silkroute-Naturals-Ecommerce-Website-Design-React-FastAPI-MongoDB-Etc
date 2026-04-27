import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link, useNavigate, NavLink, Outlet } from "react-router-dom";
import api from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useSEO } from "@/lib/seo";
import { toast } from "sonner";
import { User, ShoppingBag, MapPin, KeyRound, LogOut, Plus, Trash2, ChevronRight } from "lucide-react";

const NAV = [
  { to: "/account", end: true, label: "Orders", icon: ShoppingBag },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/password", label: "Password", icon: KeyRound },
];

export default function AccountLayout() {
  useSEO({ title: "Account" });
  const { user, ready, logout } = useAuth();
  const nav = useNavigate();

  if (!ready) return <div className="container-luxe py-32 text-foreground/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="section-pad container-luxe" data-testid="account-page">
      <div className="grid md:grid-cols-12 gap-10">
        <aside className="md:col-span-3">
          <div className="overline">My Account</div>
          <div className="font-serif text-3xl tracking-tight mt-1" data-testid="account-name">{user.name}</div>
          <div className="text-xs text-foreground/60 mt-1 break-all">{user.email}</div>

          <nav className="mt-8 border-t" style={{ borderColor: "hsl(var(--line))" }}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) =>
                `flex items-center justify-between py-3 border-b text-sm ${isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"}`
              } style={{ borderColor: "hsl(var(--line))" }} data-testid={`account-nav-${n.label.toLowerCase()}`}>
                <span className="inline-flex items-center gap-3"><n.icon size={14} />{n.label}</span>
                <ChevronRight size={14} />
              </NavLink>
            ))}
          </nav>

          {user.role === "admin" && (
            <Link to="/admin" className="btn-primary mt-6 w-full inline-flex justify-center" data-testid="account-admin-link">Admin Panel →</Link>
          )}
          <button onClick={async () => { await logout(); nav("/"); toast.success("Signed out"); }} className="btn-ghost mt-3 w-full inline-flex justify-center gap-2" data-testid="logout-button">
            <LogOut size={14} /> Sign Out
          </button>
        </aside>

        <main className="md:col-span-9"><Outlet /></main>
      </div>
    </div>
  );
}

export function AccountOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get("/orders/mine").then((r) => setOrders(r.data || [])); }, []);
  return (
    <div data-testid="account-orders">
      <div className="overline mb-3">Order history</div>
      <h2 className="font-serif text-4xl">Your orders</h2>
      <div className="mt-8 space-y-4">
        {orders.length === 0 && (
          <div className="p-12 text-center" style={{ background: "hsl(var(--background-2))" }}>
            <p className="text-foreground/60">No orders yet.</p>
            <Link to="/shop" className="btn-ghost mt-5 inline-flex">Begin Shopping →</Link>
          </div>
        )}
        {orders.map((o) => (
          <Link key={o.id} to={`/account/orders/${o.order_number}`} className="block p-6 border hover:bg-sand/30 transition" style={{ borderColor: "hsl(var(--line))" }} data-testid={`order-${o.order_number}`}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-serif text-2xl">#{o.order_number}</div>
                <div className="text-xs text-foreground/60 mt-1">{new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
                <div className="text-xs text-foreground/60 mt-1">{o.items?.length} item{o.items?.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="text-right">
                <div className="font-serif text-2xl">{formatINR(o.total)}</div>
                <div className="overline mt-1" style={{ color: "hsl(var(--gold))" }}>{o.status}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AccountProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ name: user?.name || "", phone: user?.phone || "" }); }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/me", form);
      await refresh();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div data-testid="account-profile">
      <div className="overline mb-3">Account details</div>
      <h2 className="font-serif text-4xl">Profile</h2>
      <form onSubmit={submit} className="mt-8 max-w-md space-y-6">
        <div>
          <label className="overline block mb-1">Email</label>
          <div className="luxe-input opacity-60">{user?.email}</div>
        </div>
        <div>
          <label className="overline block mb-1">Full Name</label>
          <input className="luxe-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="profile-name" />
        </div>
        <div>
          <label className="overline block mb-1">Phone</label>
          <input className="luxe-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" data-testid="profile-phone" />
        </div>
        <button disabled={saving} className="btn-primary disabled:opacity-50" data-testid="profile-save">{saving ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  );
}

export function AccountAddresses() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", is_default: false });
  const [showForm, setShowForm] = useState(false);
  const load = () => api.get("/users/me/addresses").then((r) => setList(r.data || []));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/me/addresses", form);
      toast.success("Address added");
      setForm({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", is_default: false });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    await api.delete(`/users/me/addresses/${id}`);
    load();
    toast.success("Removed");
  };

  return (
    <div data-testid="account-addresses">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="overline mb-3">Saved addresses</div>
          <h2 className="font-serif text-4xl">Addresses</h2>
        </div>
        {!showForm && <button onClick={() => setShowForm(true)} className="btn-primary inline-flex" data-testid="address-add-button"><Plus size={14} className="mr-1" /> Add Address</button>}
      </div>

      {showForm && (
        <form onSubmit={add} className="grid grid-cols-2 gap-x-5 gap-y-4 p-6 mb-8" style={{ background: "hsl(var(--background-2))" }} data-testid="address-form">
          <input className="luxe-input col-span-1" placeholder="Label (Home / Office)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input required className="luxe-input col-span-1" placeholder="PIN Code" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          <input required className="luxe-input col-span-2" placeholder="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          <input className="luxe-input col-span-2" placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <input required className="luxe-input col-span-1" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="luxe-input col-span-1" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <label className="col-span-2 text-sm flex items-center gap-2"><input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} /> Set as default</label>
          <div className="col-span-2 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
            <button className="btn-primary flex-1" data-testid="address-save">Save Address</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {list.length === 0 && !showForm && (
          <div className="p-12 text-center" style={{ background: "hsl(var(--background-2))" }}>
            <MapPin size={28} className="mx-auto mb-3" style={{ color: "hsl(var(--gold))" }} />
            <p className="text-foreground/60">No saved addresses yet.</p>
          </div>
        )}
        {list.map((a) => (
          <div key={a.id} className="p-5 border flex justify-between" style={{ borderColor: "hsl(var(--line))" }} data-testid={`address-${a.label}`}>
            <div>
              <div className="overline" style={{ color: a.is_default ? "hsl(var(--gold))" : undefined }}>{a.label}{a.is_default ? " · default" : ""}</div>
              <div className="text-sm mt-2 leading-relaxed">
                {a.line1}{a.line2 && `, ${a.line2}`}<br />
                {a.city}{a.state && `, ${a.state}`} — {a.pincode}<br />
                {a.country}
              </div>
            </div>
            <button onClick={() => remove(a.id)} className="p-2 hover:bg-sand h-fit"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountPassword() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    try {
      await api.put("/users/me/password", { current_password: form.current_password, new_password: form.new_password });
      toast.success("Password updated");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally { setSaving(false); }
  };
  return (
    <div data-testid="account-password">
      <div className="overline mb-3">Security</div>
      <h2 className="font-serif text-4xl">Change password</h2>
      <form onSubmit={submit} className="mt-8 max-w-md space-y-6">
        <input required type="password" className="luxe-input" placeholder="Current password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} data-testid="password-current" />
        <input required type="password" minLength={6} className="luxe-input" placeholder="New password (6+ chars)" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} data-testid="password-new" />
        <input required type="password" className="luxe-input" placeholder="Confirm new password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} data-testid="password-confirm" />
        <button disabled={saving} className="btn-primary disabled:opacity-50" data-testid="password-save">{saving ? "Updating..." : "Update Password"}</button>
      </form>
    </div>
  );
}
