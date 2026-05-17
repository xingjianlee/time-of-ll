import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    // already signed in
    setTimeout(() => nav({ to: "/" }), 0);
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    nav({ to: "/" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-rose/20 bg-cream/80 backdrop-blur-sm p-8 shadow-[0_30px_80px_-40px_oklch(0.4_0.1_20/0.5)]"
      >
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-rose/80">
            <Heart className="h-3.5 w-3.5 fill-rose text-rose" />
            sign in
            <Heart className="h-3.5 w-3.5 fill-rose text-rose" />
          </div>
          <h1 className="mt-3 font-display text-3xl text-wine">回到我们的手账</h1>
          <p className="mt-2 font-script text-lg text-wine/60">仅供 Sunny &amp; Felix ♡</p>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-widest text-wine/60">邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-wine/15 bg-white/70 px-3 py-2 text-wine outline-none focus:border-rose"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-xs uppercase tracking-widest text-wine/60">密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-wine/15 bg-white/70 px-3 py-2 text-wine outline-none focus:border-rose"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-lg bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm text-cream shadow-md transition hover:bg-rose/90 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          登录
        </button>

        <div className="mt-5 text-center">
          <Link to="/" className="text-xs uppercase tracking-widest text-wine/50 hover:text-rose">
            ← 回到首页
          </Link>
        </div>
      </form>
    </div>
  );
}
