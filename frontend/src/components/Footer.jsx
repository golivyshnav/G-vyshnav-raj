import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/newsletter", { email });
      toast.success("Welcome to the SOPHIE list.");
      setEmail("");
    } catch {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <footer data-testid="footer" className="border-t border-[#F3F4F6] mt-32">
      {/* Newsletter */}
      <section className="px-6 md:px-12 lg:px-24 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-end">
        <div>
          <p className="overline opacity-60 mb-6">The SOPHIE list</p>
          <h2 className="font-display text-3xl md:text-5xl tracking-tight leading-[1.1]">
            Private invitations, new arrivals,<br/> and editorial — first.
          </h2>
        </div>
        <form onSubmit={submit} className="flex border-b border-[#111]">
          <input
            data-testid="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent py-4 outline-none placeholder:opacity-30 text-base"
          />
          <button
            data-testid="newsletter-submit"
            disabled={loading}
            className="overline px-2 hover:opacity-60 transition"
          >
            {loading ? "..." : "Subscribe →"}
          </button>
        </form>
      </section>

      {/* Links */}
      <section className="px-6 md:px-12 lg:px-24 pb-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {[
          { title: "Shop", links: [["Women", "/shop?category=Women"],["Men","/shop?category=Men"],["Accessories","/shop?category=Accessories"],["Shoes","/shop?category=Shoes"]] },
          { title: "House", links: [["About","/about"],["Contact","/contact"],["Stores","/contact"],["Sustainability","/about"]] },
          { title: "Care", links: [["Shipping","/about"],["Returns","/about"],["Size Guide","/about"],["FAQ","/contact"]] },
          { title: "Follow", links: [["Instagram","#"],["Pinterest","#"],["TikTok","#"],["YouTube","#"]] },
        ].map((col) => (
          <div key={col.title}>
            <p className="overline opacity-60 mb-5">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map(([l, to]) => (
                <li key={l}>
                  <Link to={to} className="text-sm link-underline opacity-80 hover:opacity-100">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <div className="border-t border-[#F3F4F6] px-6 md:px-12 lg:px-24 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs opacity-50">© 2026 SOPHIE Maison. All rights reserved.</p>
        <p className="font-display tracking-[0.3em] text-sm opacity-60">SOPHIE — PARIS · MILANO · NEW YORK</p>
      </div>
    </footer>
  );
}
