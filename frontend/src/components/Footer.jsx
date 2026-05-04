import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo-dark.jpg" : "/logo-light.jpg";
  return (
    <footer className="mt-32 border-t" style={{ borderColor: "hsl(var(--line))" }} data-testid="site-footer">
      <div className="container-luxe py-20 grid md:grid-cols-4 gap-12">
        <div>
          <img src={logoSrc} alt="Silk Route Naturals" className="h-20 w-auto" />
          <p className="mt-6 text-sm leading-relaxed text-foreground/70 max-w-xs">
            Treasures from the ancient Silk Route. Single-origin, slow-cured, hand-graded.
          </p>
        </div>
        <div>
          <div className="overline mb-4">Discover</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/shop" className="hover-underline">Shop All</Link></li>
            <li><Link to="/our-story" className="hover-underline">Our Story</Link></li>
            <li><Link to="/nut-butter-builder" className="hover-underline">Nut Butter Atelier</Link></li>
            <li><Link to="/experience-center" className="hover-underline">Experience Center</Link></li>
            <li><Link to="/journal" className="hover-underline">Journal</Link></li>
          </ul>
        </div>
        <div>
          <div className="overline mb-4">Service</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/gifting" className="hover-underline">Corporate Gifting</Link></li>
            <li><Link to="/contact" className="hover-underline">Contact</Link></li>
            <li><Link to="/account" className="hover-underline">My Orders</Link></li>
            <li><Link to="/admin" className="hover-underline">Admin</Link></li>
          </ul>
        </div>
        <div>
          <div className="overline mb-4">Reach us</div>
          <p className="text-sm leading-relaxed text-foreground/70">
            Bengaluru, India
          </p>
          <p className="text-sm mt-3">+91 7406 995 999</p>
          <p className="text-sm">hello@silkroutenaturals.com</p>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: "hsl(var(--line))" }}>
        <div className="container-luxe py-6 flex flex-col md:flex-row justify-between text-xs text-foreground/60">
          <span>© {new Date().getFullYear()} Silk Route Naturals. All rights reserved.</span>
          <span className="overline">Crafted in India, sourced from the Silk Route</span>
        </div>
      </div>
    </footer>
  );
}
