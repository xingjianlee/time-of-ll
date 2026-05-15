import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function SiteHeader() {
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
        <nav className="flex items-center gap-8">
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
        </nav>
      </div>
    </header>
  );
}
