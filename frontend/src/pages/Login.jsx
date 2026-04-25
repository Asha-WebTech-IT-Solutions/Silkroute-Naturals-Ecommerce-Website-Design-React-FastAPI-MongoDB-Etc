import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatApiErrorDetail } from "@/lib/format";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success("Welcome back");
      nav(u.role === "admin" ? "/admin" : "/account");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="section-pad container-luxe grid md:grid-cols-2 gap-16" data-testid="login-page">
      <div className="hidden md:block img-zoom aspect-[4/5]">
        <img src="https://images.pexels.com/photos/9494903/pexels-photo-9494903.jpeg" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-sm">
        <div className="overline mb-3">Welcome back</div>
        <h1 className="font-serif text-5xl tracking-tighter">Sign in.</h1>
        <form onSubmit={submit} className="mt-12 space-y-6">
          <input required type="email" className="luxe-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="login-email" />
          <input required type="password" className="luxe-input" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="login-password" />
          <button disabled={loading} className="btn-primary w-full disabled:opacity-50" data-testid="login-submit">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="mt-8 text-sm text-foreground/60">
          New here?{" "}
          <Link to="/register" className="hover-underline" data-testid="login-to-register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
