import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import api from "../lib/api";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import { Slider } from "../components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";

const ALL_SIZES = ["XS", "S", "M", "L", "XL"];
const ALL_COLORS = ["Black","White","Ivory","Stone","Camel","Charcoal","Cognac","Olive","Navy","Sand","Burgundy","Taupe","Bone"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";
  const search = params.get("search") || "";
  const [sort, setSort] = useState(params.get("sort") || "featured");
  const [size, setSize] = useState(params.get("size") || "");
  const [color, setColor] = useState(params.get("color") || "");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { api.get("/categories").then((r) => setCategories(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const q = {
      category, sort, page, limit: 12,
      min_price: priceRange[0], max_price: priceRange[1],
    };
    if (size) q.size = size;
    if (color) q.color = color;
    if (search) q.search = search;
    api.get("/products", { params: q }).then((r) => {
      setProducts(r.data.items); setTotal(r.data.total); setLoading(false);
    });
  }, [category, sort, size, color, priceRange, page, search]);

  const setCategory = (c) => {
    const p = new URLSearchParams(params);
    if (c === "All") p.delete("category"); else p.set("category", c);
    setParams(p);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <main data-testid="shop-page" className="pt-32 md:pt-40 pb-24 px-6 md:px-12 lg:px-24">
      <div className="mb-12 flex items-end justify-between flex-wrap gap-6">
        <div>
          <p className="overline opacity-60 mb-3">{search ? `Search: "${search}"` : category === "All" ? "All Pieces" : category}</p>
          <h1 className="font-display text-4xl md:text-6xl tracking-tight">The Collection</h1>
          <p className="opacity-60 mt-3 text-sm">{total} pieces</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="filters-toggle"
            onClick={() => setShowFilters((s) => !s)}
            className="overline border border-[#111] px-5 py-3 hover:bg-[#111] hover:text-white transition"
          >
            {showFilters ? "Hide" : "Filter"}
          </button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger data-testid="sort-select" className="w-[220px] rounded-none border-[#111] h-12 overline">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-10 pb-6 border-b border-[#F3F4F6]">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            data-testid={`cat-${c}`}
            onClick={() => setCategory(c)}
            className={`overline px-4 py-2 border transition ${
              (category === c || (c === "All" && category === "All"))
                ? "bg-[#111] text-white border-[#111]"
                : "border-[#F3F4F6] hover:border-[#111]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-12">
        {/* Filters */}
        {showFilters && (
          <aside data-testid="filters-panel" className="space-y-8 fade-in">
            <div>
              <p className="overline mb-4">Size</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((s) => (
                  <button
                    key={s}
                    data-testid={`size-filter-${s}`}
                    onClick={() => setSize(size === s ? "" : s)}
                    className={`w-10 h-10 border text-xs ${size === s ? "bg-[#111] text-white border-[#111]" : "border-[#F3F4F6] hover:border-[#111]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="overline mb-4">Color</p>
              <div className="flex flex-wrap gap-2">
                {ALL_COLORS.map((c) => (
                  <button
                    key={c}
                    data-testid={`color-filter-${c}`}
                    onClick={() => setColor(color === c ? "" : c)}
                    className={`text-xs px-3 py-1.5 border ${color === c ? "bg-[#111] text-white border-[#111]" : "border-[#F3F4F6] hover:border-[#111]"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-4">
                <p className="overline">Price</p>
                <p className="text-xs opacity-60">${priceRange[0]} — ${priceRange[1]}</p>
              </div>
              <Slider
                data-testid="price-slider"
                value={priceRange}
                onValueChange={setPriceRange}
                min={0} max={1000} step={10}
              />
            </div>
            {(size || color || priceRange[0] > 0 || priceRange[1] < 1000) && (
              <button
                data-testid="clear-filters"
                onClick={() => { setSize(""); setColor(""); setPriceRange([0, 1000]); }}
                className="overline opacity-70 flex items-center gap-2"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </aside>
        )}

        {/* Grid */}
        <div className={showFilters ? "" : "lg:col-span-2"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {loading
              ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p, i) => <ProductCard key={p.id} product={p} idx={i} />)
            }
          </div>
          {!loading && products.length === 0 && (
            <div className="text-center py-20" data-testid="empty-products">
              <p className="font-display text-2xl mb-2">No pieces match your filters</p>
              <p className="opacity-60 text-sm">Adjust your selection to see more.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-16" data-testid="pagination">
              {Array(totalPages).fill(0).map((_, i) => (
                <button
                  key={i}
                  data-testid={`page-${i+1}`}
                  onClick={() => setPage(i+1)}
                  className={`w-10 h-10 overline ${page === i+1 ? "bg-[#111] text-white" : "border border-[#F3F4F6] hover:border-[#111]"}`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
