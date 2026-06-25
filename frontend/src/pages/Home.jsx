import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, Award } from "lucide-react";
import api from "../lib/api";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";

export default function Home() {
  const [newest, setNewest] = useState([]);
  const [best, setBest] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/products/new"),
      api.get("/products/bestsellers"),
      api.get("/products/featured"),
    ]).then(([n, b, f]) => {
      setNewest(n.data); setBest(b.data); setFeatured(f.data); setLoading(false);
    });
  }, []);

  return (
    <main data-testid="home-page" className="pt-24 md:pt-28">
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1771591742001-f689076a78a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwyfHxoaWdoJTIwZmFzaGlvbiUyMG1vZGVsJTIwc3R1ZGlvJTIwd2hpdGUlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc4MjQxMjQ0NHww&ixlib=rb-4.1.0&q=85"
          alt="SOPHIE Spring Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="px-6 md:px-12 lg:px-24 pb-24 max-w-4xl text-white fade-up">
            <p className="overline mb-6 opacity-90">Spring · Summer 2026</p>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight font-normal">
              Quiet, considered,<br/>made to last.
            </h1>
            <p className="mt-8 max-w-md text-base opacity-90 leading-relaxed">
              An edited wardrobe of pieces designed in Paris and tailored in Italy. No noise — just luxury that lives with you.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                data-testid="hero-shop-now"
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 overline hover:bg-[#F3F4F6] transition"
              >
                Shop Now <ArrowRight size={14} />
              </Link>
              <Link
                to="/shop?category=Women"
                className="inline-flex items-center gap-3 border border-white/70 text-white px-8 py-4 overline hover:bg-white hover:text-black transition"
              >
                The Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-[#F3F4F6] py-5 overflow-hidden">
        <div className="flex whitespace-nowrap marquee gap-16">
          {Array(2).fill(0).map((_, j) => (
            <div key={j} className="flex gap-16 shrink-0">
              {["Hand-tailored in Italy", "Complimentary shipping over $150", "Ethical sourcing", "30-day returns", "Lifetime craftsmanship", "Paris · Milano · New York"].map((t,i)=>(
                <span key={i} className="overline opacity-60 flex items-center gap-16">
                  {t} <span>—</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="overline opacity-60 mb-4">New In</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">New Arrivals</h2>
          </div>
          <Link to="/shop?sort=newest" className="overline link-underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : newest.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
        </div>
      </section>

      {/* FEATURED COLLECTION SPLIT */}
      <section className="grid md:grid-cols-2 gap-0">
        {[
          { img: "https://images.pexels.com/photos/27641318/pexels-photo-27641318.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=940", title: "The Atelier Edit", desc: "Pieces from the maison, hand-finished.", cat: "Women" },
          { img: "https://images.pexels.com/photos/31042862/pexels-photo-31042862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=940", title: "Heritage Tailoring", desc: "Suiting redefined for the modern man.", cat: "Men" },
        ].map((c) => (
          <Link key={c.title} to={`/shop?category=${c.cat}`} className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden group">
            <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 md:p-16 text-white">
              <p className="overline mb-3 opacity-80">{c.cat}</p>
              <h3 className="font-display text-4xl md:text-5xl mb-3">{c.title}</h3>
              <p className="opacity-80 mb-6 max-w-sm">{c.desc}</p>
              <span className="overline border-b border-white pb-1">Discover →</span>
            </div>
          </Link>
        ))}
      </section>

      {/* BESTSELLERS */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="overline opacity-60 mb-4">Loved by you</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">Best Sellers</h2>
          </div>
          <Link to="/shop" className="overline link-underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : best.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="grid md:grid-cols-2 gap-0 border-t border-[#F3F4F6]">
        <div className="flex items-center px-6 md:px-16 py-20 md:py-32">
          <div className="max-w-md">
            <p className="overline opacity-60 mb-6">Our story</p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight mb-8">
              Founded on the belief that less can be everything.
            </h2>
            <p className="opacity-70 leading-relaxed mb-8">
              SOPHIE was born in a quiet Parisian apartment in 2014, with one rule: only make what we'd wear forever. We work with ateliers in Florence, Como and Porto — hand-finishing every garment to a standard you can feel.
            </p>
            <Link to="/about" className="overline border-b border-black pb-1">Read more →</Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] md:aspect-auto">
          <img src="https://images.pexels.com/photos/11911863/pexels-photo-11911863.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=940" alt="Atelier" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* FEATURED PRODUCTS GRID */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="text-center mb-16">
          <p className="overline opacity-60 mb-4">Featured</p>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight">The Edit</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {loading
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-[#F3F4F6]">
        <p className="overline opacity-60 mb-4 text-center">Reviews</p>
        <h2 className="font-display text-4xl md:text-5xl text-center mb-16">From our customers</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { q: "The silk dress is breathtaking. I've never owned anything that drapes like this — worth every penny.", a: "Amelia R., London" },
            { q: "Truly the best knit in my wardrobe. Three winters in, still pristine.", a: "Hiro T., Tokyo" },
            { q: "Service like a private boutique. They remembered my preferences a year later.", a: "Camille D., Paris" },
          ].map((r, i) => (
            <div key={i} className="border-t border-[#111] pt-8 fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="flex gap-1 mb-5">{Array(5).fill(0).map((_,j)=>(<Star key={j} size={12} className="fill-black" strokeWidth={0} />))}</div>
              <p className="text-base leading-relaxed mb-6 font-display italic">"{r.q}"</p>
              <p className="overline opacity-60">— {r.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="px-6 md:px-12 lg:px-24 pb-24 md:pb-32">
        <div className="text-center mb-12">
          <p className="overline opacity-60 mb-4">Follow</p>
          <h2 className="font-display text-3xl md:text-4xl">@sophie.maison</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {[
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
            "https://images.pexels.com/photos/27641318/pexels-photo-27641318.jpeg?auto=compress&w=400",
            "https://images.unsplash.com/flagged/photo-1553802922-e345434156e6?w=400&q=80",
            "https://images.pexels.com/photos/11911863/pexels-photo-11911863.jpeg?auto=compress&w=400",
            "https://images.unsplash.com/photo-1575403538007-acb790100421?w=400&q=80",
            "https://images.pexels.com/photos/31042862/pexels-photo-31042862.jpeg?auto=compress&w=400",
          ].map((src, i) => (
            <a key={i} href="#" className="aspect-square overflow-hidden bg-[#FAFAFA] group" data-testid={`insta-${i}`}>
              <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[900ms] ease-out" />
            </a>
          ))}
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="border-y border-[#F3F4F6] px-6 md:px-12 lg:px-24 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { Icon: Truck, t: "Complimentary Shipping", d: "On all orders over $150 worldwide." },
            { Icon: Shield, t: "Lifetime Care", d: "Free repairs & alterations on every piece." },
            { Icon: Award, t: "Hand-Finished", d: "By master artisans in Italy & Portugal." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-start gap-5">
              <Icon size={28} strokeWidth={1} />
              <div>
                <p className="font-medium mb-1">{t}</p>
                <p className="text-sm opacity-60">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
