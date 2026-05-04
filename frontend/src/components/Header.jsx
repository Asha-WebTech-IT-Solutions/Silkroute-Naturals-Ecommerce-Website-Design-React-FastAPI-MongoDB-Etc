import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X, Heart, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";
import SearchModal from "@/components/SearchModal";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/our-story", label: "Our Story" },
  { to: "/nut-butter-builder", label: "Nut Butter Atelier" },
  { to: "/experience-center", label: "Experience" },
  { to: "/gifting", label: "Gifting" },
  { to: "/journal", label: "Journal" },
];

export default function Header() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const { count: wishCount } = useWishlist();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const logoSrc = theme === "dark" ? "/logo-dark.jpg" : "/logo-light.jpg";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50" data-testid="site-header">
        <div className="overflow-hidden border-b" style={{ background: "hsl(var(--foreground))", borderColor: "hsl(var(--foreground))" }}>
          <div className="marquee-track py-2 text-[10px] tracking-[0.32em] uppercase font-light" style={{ color: "hsl(var(--background))" }}>
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex gap-16 shrink-0">
                <span>Afghanistan</span><span>·</span><span>Iran</span><span>·</span><span>Turkey</span>
                <span>·</span><span>India</span><span>·</span><span>Morocco</span><span>·</span>
                <span>Single-origin · Small-batch · Slow-cured</span><span>·</span>
                <span>Free shipping over ₹1,499</span><span>·</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`backdrop-blur-md transition-colors duration-500 ${scrolled ? "bg-background/95" : "bg-background/85"}`}
          style={{ borderBottom: "1px solid hsl(var(--line))" }}
        >
          <div className="container-luxe flex items-center justify-between h-20">
            <button onClick={() => setMobile(true)} className="md:hidden" data-testid="mobile-menu-open" aria-label="menu">
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center" data-testid="brand-logo">
              <img src={logoSrc} alt="Silk Route Naturals" className="h-12 md:h-14 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-7">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  data-testid={`nav-${n.to === "/" ? "home" : n.to.replace("/", "")}`}
                  className={({ isActive }) =>
                    `text-[12px] tracking-[0.18em] uppercase font-medium hover-underline ${isActive ? "text-foreground" : "text-foreground/70"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <button onClick={toggle} aria-label="toggle theme" data-testid="theme-toggle" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setSearchOpen(true)} aria-label="search" data-testid="search-button"><Search size={18} /></button>
              <button onClick={() => navigate("/wishlist")} className="relative hidden md:inline-flex" aria-label="wishlist" data-testid="wishlist-button">
                <Heart size={18} />
                {wishCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] w-4 h-4 flex items-center justify-center rounded-full" style={{ background: "hsl(var(--gold))", color: "white" }} data-testid="wishlist-count">
                    {wishCount}
                  </span>
                )}
              </button>
              <button onClick={() => navigate(user ? "/account" : "/login")} aria-label="account" data-testid="account-button">
                <User size={18} />
              </button>
              <button onClick={() => setOpen(true)} className="relative" aria-label="cart" data-testid="cart-button">
                <ShoppingBag size={18} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] w-4 h-4 flex items-center justify-center rounded-full" style={{ background: "hsl(var(--gold))", color: "white" }} data-testid="cart-count">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {mobile && (
          <div className="md:hidden fixed inset-0 z-50 bg-background" data-testid="mobile-menu">
            <div className="flex justify-between items-center p-6 border-b border-line">
              <img src={logoSrc} alt="Silk Route Naturals" className="h-10 w-auto" />
              <button onClick={() => setMobile(false)} data-testid="mobile-menu-close"><X size={20} /></button>
            </div>
            <nav className="flex flex-col p-6 gap-6">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} onClick={() => setMobile(false)} className="font-serif text-3xl">
                  {n.label}
                </NavLink>
              ))}
              <NavLink to="/wishlist" onClick={() => setMobile(false)} className="font-serif text-3xl">Wishlist</NavLink>
              <NavLink to="/contact" onClick={() => setMobile(false)} className="font-serif text-3xl">Contact</NavLink>
            </nav>
          </div>
        )}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
