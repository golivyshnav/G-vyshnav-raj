import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, Heart, Truck, RotateCcw, Star } from "lucide-react";
import api from "../lib/api";
import { useCart, useWishlist, useRecentlyViewed } from "../lib/store";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const addItem = useCart((s) => s.addItem);
  const toggleWish = useWishlist((s) => s.toggle);
  const hasWish = useWishlist((s) => (product ? s.has(product.id) : false));
  const pushRecent = useRecentlyViewed((s) => s.push);

  useEffect(() => {
    setProduct(null); setActiveImg(0);
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setSize(r.data.sizes?.[0] || "");
      setColor(r.data.colors?.[0] || "");
      pushRecent(r.data.id);
    });
    api.get(`/products/${id}/related`).then((r) => setRelated(r.data));
    api.get(`/reviews/${id}`).then((r) => setReviews(r.data));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]); // eslint-disable-line

  if (!product) {
    return (
      <main className="pt-32 px-6 md:px-12 lg:px-24 grid lg:grid-cols-2 gap-12">
        <div className="bg-[#F3F4F6] aspect-[3/4] animate-pulse" />
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-2/3 bg-[#F3F4F6]" />
          <div className="h-4 w-1/3 bg-[#F3F4F6]" />
        </div>
      </main>
    );
  }

  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  const addToBag = () => {
    if (!size || !color) {
      toast.error("Please select size and color");
      return;
    }
    addItem({ product_id: product.id, quantity: qty, size, color });
    toast.success(`${product.name} added to bag`);
  };

  const buyNow = () => {
    if (!size || !color) { toast.error("Please select size and color"); return; }
    addItem({ product_id: product.id, quantity: qty, size, color });
    nav("/checkout");
  };

  return (
    <main data-testid="product-detail" className="pt-28 md:pt-32 pb-24">
      <div className="px-6 md:px-12 lg:px-24 mb-6">
        <p className="overline opacity-60">
          <Link to="/shop" className="hover:opacity-100">Shop</Link> / <Link to={`/shop?category=${product.category}`}>{product.category}</Link>
        </p>
      </div>
      <div className="px-6 md:px-12 lg:px-24 grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-16">
        {/* Gallery */}
        <div className="flex gap-4">
          <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
            {product.images.map((img, i) => (
              <button
                key={i}
                data-testid={`thumb-${i}`}
                onClick={() => setActiveImg(i)}
                className={`aspect-[3/4] overflow-hidden bg-[#FAFAFA] border ${activeImg === i ? "border-[#111]" : "border-transparent"}`}
              >
                <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-[#FAFAFA] overflow-hidden group">
            <img
              src={product.images[activeImg]}
              alt={product.name}
              data-testid="main-image"
              className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
            />
          </div>
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-32 self-start">
          <p className="overline opacity-60 mb-3">{product.category}</p>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-4" data-testid="product-name">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-1">
              {Array(5).fill(0).map((_, i) => (<Star key={i} size={12} className={i < Math.round(product.rating) ? "fill-black" : "opacity-30"} strokeWidth={0} />))}
            </div>
            <span className="text-xs opacity-60">{product.rating} · {reviews.length} reviews</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl font-display" data-testid="product-price">${product.price.toFixed(0)}</span>
            {discount > 0 && (
              <>
                <span className="opacity-40 line-through">${product.original_price.toFixed(0)}</span>
                <span className="overline bg-[#111] text-white px-2 py-0.5">-{discount}%</span>
              </>
            )}
          </div>

          {/* Color */}
          <div className="mb-7">
            <div className="flex justify-between mb-3">
              <p className="overline">Color</p>
              <p className="overline opacity-60">{color}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  data-testid={`color-${c}`}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 text-xs border transition ${color === c ? "border-[#111] bg-[#111] text-white" : "border-[#F3F4F6] hover:border-[#111]"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-7">
            <div className="flex justify-between mb-3">
              <p className="overline">Size</p>
              <button className="overline opacity-60 underline">Size Guide</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  data-testid={`size-${s}`}
                  onClick={() => setSize(s)}
                  className={`h-11 text-xs border transition ${size === s ? "bg-[#111] text-white border-[#111]" : "border-[#F3F4F6] hover:border-[#111]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <p className="overline mb-3">Quantity</p>
            <div className="flex items-center border border-[#F3F4F6] w-fit">
              <button data-testid="qty-decr" onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-[#FAFAFA]"><Minus size={14}/></button>
              <span className="px-5 tabular-nums">{qty}</span>
              <button data-testid="qty-incr" onClick={() => setQty(qty + 1)} className="p-3 hover:bg-[#FAFAFA]"><Plus size={14}/></button>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <button
              data-testid="add-to-bag"
              onClick={addToBag}
              className="w-full bg-[#111] text-white py-4 overline hover:bg-[#333] transition"
            >
              Add to Bag
            </button>
            <div className="flex gap-3">
              <button
                data-testid="buy-now"
                onClick={buyNow}
                className="flex-1 border border-[#111] py-4 overline hover:bg-[#111] hover:text-white transition"
              >
                Buy Now
              </button>
              <button
                data-testid="wishlist-toggle"
                onClick={() => toggleWish(product.id)}
                className="border border-[#F3F4F6] px-5 hover:border-[#111] transition"
              >
                <Heart size={18} className={hasWish ? "fill-black" : ""} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 py-6 border-y border-[#F3F4F6]">
            <div className="flex items-center gap-3 text-xs opacity-70">
              <Truck size={16} strokeWidth={1.5} /> Free shipping over $150
            </div>
            <div className="flex items-center gap-3 text-xs opacity-70">
              <RotateCcw size={16} strokeWidth={1.5} /> 30-day returns
            </div>
          </div>

          <p className="text-sm opacity-80 leading-relaxed mb-6" data-testid="product-description">{product.description}</p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="materials" className="border-[#F3F4F6]">
              <AccordionTrigger className="overline hover:no-underline">Materials & Care</AccordionTrigger>
              <AccordionContent className="text-sm opacity-70 leading-relaxed">
                {product.material}. Dry clean only. Store on a wide hanger to preserve shape.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping" className="border-[#F3F4F6]">
              <AccordionTrigger className="overline hover:no-underline">Shipping</AccordionTrigger>
              <AccordionContent className="text-sm opacity-70 leading-relaxed">
                Complimentary on orders over $150. Express 1–3 business days. Carbon-neutral delivery.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns" className="border-[#F3F4F6]">
              <AccordionTrigger className="overline hover:no-underline">Returns</AccordionTrigger>
              <AccordionContent className="text-sm opacity-70 leading-relaxed">
                Free returns within 30 days. Pieces must be unworn with tags attached.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-6 md:px-12 lg:px-24 pt-32">
          <h2 className="font-display text-3xl md:text-4xl mb-12">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {related.map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)}
          </div>
        </section>
      )}
    </main>
  );
}
