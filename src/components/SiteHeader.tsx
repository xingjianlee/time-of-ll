import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { user, owner, signOut } = useAuth();
  const nav = useNavigate();
  const linkClass =
    "relative px-1 text-sm tracking-widest uppercase text-wine/70 transition-colors hover:text-rose";
  const activeProps = { className: linkClass + " text-rose" };

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="group flex items-center gap-2">
          <Heart className="h-4 w-4 fill-rose text-rose group-hover:animate-heartbeat" />
          <span className="font-display text-xl text-wine">Time of Sunny &amp; Felix</span>
        </Link>
        <nav className="flex items-center gap-6 md:gap-8">
          <Link to="/" className={linkClass} activeOptions={{ exact: true }} activeProps={activeProps}>
            Home
          </Link>
          <Link to="/timeline" className={linkClass} activeProps={activeProps}>
            Timeline
          </Link>
          <Link to="/wishlist" className={linkClass} activeProps={activeProps}>
            Wishlist
          </Link>
          <Link to="/giftjar" className={linkClass} activeProps={activeProps}>
            Gift Jar
          </Link>
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                nav({ to: "/login" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-3 py-1 text-xs uppercase tracking-widest text-rose hover:bg-cream"
              title={user.email ?? ""}
            >
              <LogOut className="h-3 w-3" />
              {owner ?? "logout"}
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-3 py-1 text-xs uppercase tracking-widest text-rose hover:bg-cream"
            >
              <LogIn className="h-3 w-3" />
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
