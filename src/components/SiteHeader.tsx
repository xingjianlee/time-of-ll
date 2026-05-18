import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogIn, LogOut, Bell, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/couple";
import { useInbox } from "@/lib/couple";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { unread } = useInbox();
  const nav = useNavigate();
  const linkClass =
    "relative px-1 text-sm tracking-widest uppercase text-wine/70 transition-colors hover:text-rose";
  const activeProps = { className: linkClass + " text-rose" };
  const iconBtn =
    "relative inline-flex items-center justify-center h-8 w-8 rounded-full border border-rose/30 bg-cream/60 text-wine/70 hover:text-rose hover:bg-cream transition";

  const name = profile?.display_name || user?.email?.split("@")[0] || "";

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="group flex items-center gap-2">
          <Heart className="h-4 w-4 fill-rose text-rose group-hover:animate-heartbeat" />
          <span className="font-display text-xl text-wine">Time of Us</span>
        </Link>
        <nav className="flex items-center gap-5 md:gap-7">
          {user ? (
            <>
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

              <Link to="/inbox" className={iconBtn} title="收信箱" aria-label="Inbox">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-rose px-1 text-[10px] leading-4 text-cream text-center">
                    {unread}
                  </span>
                )}
              </Link>
              <Link to="/settings" className={iconBtn} title="设置" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  nav({ to: "/" });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-3 py-1 text-xs uppercase tracking-widest text-rose hover:bg-cream max-w-[140px] truncate"
                title={user.email ?? ""}
              >
                <LogOut className="h-3 w-3 shrink-0" />
                <span className="truncate">{name || "logout"}</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-cream/60 px-4 py-1.5 text-xs uppercase tracking-widest text-rose hover:bg-cream"
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
