import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "../lib/store";
import api from "../lib/api";

export default function Cart() {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const [products, setProducts] = useState({});

  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.product_id))];
    if (!ids.length) return;
    Promise.all(ids.map((id) => api.get(`/products/${id}`).then((r) => r.data).catch(() => null)))
      .then((res) => {
        const map = {};
        res.forEach((p) => p && (map[p.id] = p));
        setProducts(map);
      });
  }, [items]);

  const subtotal = items.reduce((sum, i) => sum + ((products[i.product_id]?.price || 0) * i.quantity), 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main data-testid="cart-page" className="pt-40 pb-32 px-6 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} strokeWidth={1} className="opacity-30 mb-8" />
        <h1 className="font-display text-4xl md:text-5xl mb-4">Your bag is empty</h1>
        <p className="opacity-60 mb-10 max-w-md">No pieces yet. Browse the collection to begin curating your wardrobe.</p>
        <Link to="/shop" className="bg-[#111] text-white px-10 py-4 overline hover:bg-[#333] transition" data-testid="empty-cart-shop">
          Shop the collection →
        </Link>
      </main>
    );
  }

  return (
    <main data-testid="cart-page" className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="mb-12">
        <p className="overline opacity-60 mb-3">Bag</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Your Shopping Bag</h1>
        <p className="opacity-60 mt-2 text-sm">{items.length} item{items.length>1?"s":""}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-16">
        <div className="space-y-8">
          {items.map((i) => {
            const p = products[i.product_id];
            if (!p) return null;
            return (
              <div key={`${i.product_id}-${i.size}-${i.color}`} className="flex gap-6 pb-8 border-b border-[#F3F4F6]" data-testid={`cart-row-${i.product_id}`}>
                <Link to={`/product/${p.id}`} className="shrink-0">
                  <img src={p.images?.[0]} alt={p.name} className="w-32 h-44 object-cover bg-[#FAFAFA]" />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="overline opacity-60 mb-1">{p.category}</p>
                      <Link to={`/product/${p.id}`}><h3 className="font-medium hover:underline">{p.name}</h3></Link>
                      <p className="overline opacity-60 mt-2">{i.color} · {i.size}</p>
                    </div>
                    <p className="font-medium">${(p.price * i.quantity).toFixed(0)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-6">
                    <div className="flex items-center border border-[#F3F4F6]">
                      <button onClick={() => updateQty(i.product_id, i.size, i.color, i.quantity-1)} className="p-2.5 hover:bg-[#FAFAFA]"><Minus size={12}/></button>
                      <span className="px-4 text-sm tabular-nums">{i.quantity}</span>
                      <button onClick={() => updateQty(i.product_id, i.size, i.color, i.quantity+1)} className="p-2.5 hover:bg-[#FAFAFA]"><Plus size={12}/></button>
                    </div>
                    <button onClick={() => removeItem(i.product_id, i.size, i.color)} className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1.5" data-testid={`remove-${i.product_id}`}>
                      <X size={12}/> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-32 self-start bg-[#FAFAFA] p-8">
          <p className="overline mb-6">Order Summary</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="opacity-70">Subtotal</span><span data-testid="summary-subtotal">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="opacity-70">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            <div className="border-t border-[#E5E7EB] pt-4 mt-4 flex justify-between text-base font-medium"><span>Total</span><span data-testid="summary-total">${total.toFixed(2)}</span></div>
          </div>
          <Link to="/checkout" className="block text-center bg-[#111] text-white py-4 overline mt-8 hover:bg-[#333] transition" data-testid="cart-checkout">
            Proceed to Checkout →
          </Link>
          <Link to="/shop" className="block text-center mt-4 overline opacity-70 hover:opacity-100">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
