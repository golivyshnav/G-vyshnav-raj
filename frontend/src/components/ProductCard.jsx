import { Link } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { useCart, useWishlist } from "../lib/store";
import { toast } from "sonner";

export default function ProductCard({ product, idx = 0 }) {
  const addItem = useCart((s) => s.addItem);
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has(product.id));

  const quickAdd = (e) => {
    e.preventDefault();
    addItem({
      product_id: product.id,
      quantity: 1,
      size: product.sizes?.[0] || "M",
      color: product.colors?.[0] || "Black",
    });
    toast.success(`${product.name} added to bag`);
  };

  const wish = (e) => {
    e.preventDefault();
    toggle(product.id);
  };

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="group block fade-up"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="product-img-wrap bg-[#FAFAFA] aspect-[3/4] relative">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="img-main w-full h-full object-cover"
          loading="lazy"
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name + " alt"}
            className="img-alt w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="overline bg-white px-2 py-1">New</span>
          )}
          {discount > 0 && (
            <span data-testid="discount-badge" className="overline bg-[#111] text-white px-2 py-1">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={wish}
          data-testid={`wishlist-${product.id}`}
          aria-label="Wishlist"
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition"
        >
          <Heart size={15} className={has ? "fill-black" : ""} />
        </button>

        {/* Quick add */}
        <button
          onClick={quickAdd}
          data-testid={`quick-add-${product.id}`}
          className="absolute inset-x-3 bottom-3 bg-[#111] text-white py-3 overline opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Quick Add
        </button>
      </div>

      <div className="pt-4 flex flex-col gap-1">
        <p className="overline opacity-50">{product.category}</p>
        <h3 className="text-sm font-medium tracking-tight">{product.name}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">${product.price.toFixed(0)}</span>
          {discount > 0 && (
            <span className="opacity-40 line-through text-xs">${product.original_price.toFixed(0)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#F3F4F6] aspect-[3/4]" />
      <div className="pt-4 space-y-2">
        <div className="h-2 w-12 bg-[#F3F4F6]" />
        <div className="h-3 w-32 bg-[#F3F4F6]" />
        <div className="h-3 w-16 bg-[#F3F4F6]" />
      </div>
    </div>
  );
}
