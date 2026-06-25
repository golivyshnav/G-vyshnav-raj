import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useCart, useAuth, useWishlist } from "../lib/store";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=Women", label: "Women" },
  { to: "/shop?category=Men", label: "Men" },
  { to: "/shop?category=Accessories", label: "Accessories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const items = useCart((s) => s.items);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  const user = useAuth((s) => s.user);
  const wishCount = useWishlist((s) => s.ids.length);
  const navigate = useNavigate();
  const count = items.reduce((a, i) => a + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/85 backdrop-blur-xl border-b border-[#F3F4F6]" : "bg-white border-b border-transparent"
      }`}
    >
      {/* Announcement bar */}
      <div className="bg-[#111111] text-white text-[11px] tracking-[0.25em] uppercase text-center py-2.5 font-light">
        Complimentary shipping on orders over $150 — Use code SOPHIE20
      </div>

      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" data-testid="nav-logo" className="font-display text-2xl md:text-3xl tracking-[0.15em] font-medium">
            SOPHIE
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-[12px] tracking-[0.2em] uppercase font-medium link-underline transition-opacity ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <button data-testid="nav-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={18} className="opacity-70 hover:opacity-100 transition" />
            </button>
            <Link to="/account" data-testid="nav-account-btn" aria-label="Account">
              <User size={18} className="opacity-70 hover:opacity-100 transition" />
            </Link>
            <Link to="/account" data-testid="nav-wishlist-btn" aria-label="Wishlist" className="relative hidden md:block">
              <Heart size={18} className="opacity-70 hover:opacity-100 transition" />
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-2 text-[9px] tabular-nums">{wishCount}</span>
              )}
            </Link>
            <button
              data-testid="nav-cart-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Cart"
              className="relative"
            >
              <ShoppingBag size={18} className="opacity-70 hover:opacity-100 transition" />
              {count > 0 && (
                <span data-testid="cart-count" className="absolute -top-2 -right-3 text-[10px] tabular-nums bg-black text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button
              data-testid="nav-mobile-toggle"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white z-[60] fade-in" data-testid="search-overlay">
          <div className="flex justify-end p-6">
            <button onClick={() => setSearchOpen(false)} aria-label="Close" data-testid="search-close">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={submitSearch} className="max-w-3xl mx-auto px-6 mt-20">
            <p className="overline opacity-60 mb-6">What are you looking for?</p>
            <input
              data-testid="search-input"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Silk dress, leather tote, cashmere..."
              className="w-full bg-transparent border-b border-[#111] py-4 text-2xl md:text-4xl font-display outline-none placeholder:opacity-30"
            />
            <p className="overline opacity-40 mt-6">Press enter to search</p>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-[60] lg:hidden fade-in" data-testid="mobile-menu">
          <div className="flex items-center justify-between p-6 border-b border-[#F3F4F6]">
            <span className="font-display text-2xl tracking-[0.15em]">SOPHIE</span>
            <button onClick={() => setMobileOpen(false)} data-testid="mobile-close" aria-label="Close">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-6">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-link-${l.label.toLowerCase()}`}
                className="text-2xl font-display py-3 border-b border-[#F3F4F6]"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-6 overline opacity-70">
                Sign in / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
