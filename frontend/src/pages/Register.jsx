import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatApiErrorDetail } from "@/lib/format";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created");
      nav("/account");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="section-pad container-luxe grid md:grid-cols-2 gap-16" data-testid="register-page">
      <div className="hidden md:block img-zoom aspect-[4/5]">
        <img src="https://images.pexels.com/photos/35045845/pexels-photo-35045845.jpeg" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-sm">
        <div className="overline mb-3">Begin the journey</div>
        <h1 className="font-serif text-5xl tracking-tighter">Create an account.</h1>
        <form onSubmit={submit} className="mt-12 space-y-6">
          <input required className="luxe-input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="register-name" />
          <input required type="email" className="luxe-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="register-email" />
          <input className="luxe-input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="register-phone" />
          <input required type="password" minLength={6} className="luxe-input" placeholder="Password (6+ chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="register-password" />
          <button disabled={loading} className="btn-primary w-full disabled:opacity-50" data-testid="register-submit">{loading ? "Creating..." : "Create Account"}</button>
        </form>
        <p className="mt-8 text-sm text-foreground/60">Already a member? <Link to="/login" className="hover-underline">Sign in</Link></p>
      </div>
    </div>
  );
}
