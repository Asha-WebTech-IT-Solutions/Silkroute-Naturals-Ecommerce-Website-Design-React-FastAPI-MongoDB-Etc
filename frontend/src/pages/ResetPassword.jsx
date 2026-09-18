import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSEO } from "@/lib/seo";

export default function ResetPassword() {
  useSEO({ title: "Reset Password" });
  const [params] = useSearchParams();
  const token = params.get("token");
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password updated. Please sign in.");
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Reset failed, link may have expired");
    } finally { setLoading(false); }
  };

  return (
    <div className="section-pad container-luxe grid md:grid-cols-2 gap-16" data-testid="reset-page">
      <div className="hidden md:block img-zoom aspect-[4/5]">
        <img src="https://images.unsplash.com/photo-1633677491262-0a51b9851f46" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-sm">
        <div className="overline mb-3">Account</div>
        <h1 className="font-serif text-5xl tracking-tighter">New password.</h1>
        {!token ? (
          <p className="mt-6 text-foreground/70">Invalid or missing reset link. <Link to="/forgot-password" className="hover-underline">Request a new one</Link>.</p>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-6">
            <input required type="password" minLength={6} className="luxe-input" placeholder="New password (6+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="reset-password" />
            <input required type="password" minLength={6} className="luxe-input" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} data-testid="reset-confirm" />
            <button disabled={loading} className="btn-primary w-full disabled:opacity-50" data-testid="reset-submit">{loading ? "Updating..." : "Update Password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
