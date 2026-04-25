import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSEO } from "@/lib/seo";

export default function ForgotPassword() {
  useSEO({ title: "Forgot Password" });
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setDone(true); toast.success("Reset link sent if email exists");
    } catch (err) {
      // intentionally do not leak existence — show generic success
      setDone(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="section-pad container-luxe grid md:grid-cols-2 gap-16" data-testid="forgot-page">
      <div className="hidden md:block img-zoom aspect-[4/5]">
        <img src="https://images.unsplash.com/photo-1633677491262-0a51b9851f46" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-sm">
        <div className="overline mb-3">Account</div>
        <h1 className="font-serif text-5xl tracking-tighter">Forgot password?</h1>
        {done ? (
          <div className="mt-10 p-8" style={{ background: "hsl(var(--background-2))" }} data-testid="forgot-success">
            <div className="font-serif text-2xl">Check your inbox.</div>
            <p className="text-sm text-foreground/70 mt-3">If an account exists for <em>{email}</em>, a reset link has been sent.</p>
            <Link to="/login" className="btn-ghost mt-6 inline-flex">Back to Sign In</Link>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-foreground/70">Enter your email and we'll send a reset link.</p>
            <form onSubmit={submit} className="mt-10 space-y-6">
              <input required type="email" className="luxe-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email" />
              <button disabled={loading} className="btn-primary w-full disabled:opacity-50" data-testid="forgot-submit">{loading ? "Sending..." : "Send Reset Link"}</button>
            </form>
            <p className="mt-8 text-sm text-foreground/60"><Link to="/login" className="hover-underline">← Back to Sign In</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
