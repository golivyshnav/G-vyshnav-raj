import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "../lib/store";
import api from "../lib/api";

export default function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const setOpen = useCart((s) => s.setDrawerOpen);
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);

  const [products, setProducts] = useState({});

  useEffect(() => {
    let active = true;
    (async () => {
      const ids = [...new Set(items.map((i) => i.product_id))].filter((id) => !products[id]);
      if (!ids.length) return;
      const map = { ...products };
      await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await api.get(`/products/${id}`);
            map[id] = r.data;
          } catch {}
        })
      );
      if (active) setProducts(map);
    })();
    return () => { active = false; };
    // eslint-disable-next-line
  }, [items]);

  const subtotal = items.reduce((sum, i) => {
    const p = products[i.product_id];
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);

  return (
    <>
      {open && (
        <div
          data-testid="cart-overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-[70] fade-in"
        />
      )}
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-[80] transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F3F4F6]">
          <p className="overline">Shopping Bag ({items.length})</p>
          <button data-testid="cart-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8" data-testid="cart-empty">
            <ShoppingBag size={48} strokeWidth={1} className="opacity-30 mb-6" />
            <p className="font-display text-2xl mb-2">Your bag is empty</p>
            <p className="opacity-60 text-sm mb-8">Pieces you love will live here.</p>
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              data-testid="cart-empty-shop"
              className="overline border-b border-black pb-1"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.map((i) => {
                const p = products[i.product_id];
                if (!p) return null;
                return (
                  <div key={`${i.product_id}-${i.size}-${i.color}`} className="flex gap-4" data-testid={`cart-item-${i.product_id}`}>
                    <img src={p.images?.[0]} alt={p.name} className="w-24 h-32 object-cover bg-[#FAFAFA]" />
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between gap-2">
                        <h4 className="text-sm font-medium">{p.name}</h4>
                        <p className="text-sm">${(p.price * i.quantity).toFixed(0)}</p>
                      </div>
                      <p className="overline opacity-60 mt-1">{i.color} · {i.size}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-[#F3F4F6]">
                          <button
                            data-testid={`cart-decr-${i.product_id}`}
                            onClick={() => updateQty(i.product_id, i.size, i.color, i.quantity - 1)}
                            className="p-2 hover:bg-[#FAFAFA]"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-sm tabular-nums">{i.quantity}</span>
                          <button
                            data-testid={`cart-incr-${i.product_id}`}
                            onClick={() => updateQty(i.product_id, i.size, i.color, i.quantity + 1)}
                            className="p-2 hover:bg-[#FAFAFA]"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          data-testid={`cart-remove-${i.product_id}`}
                          onClick={() => removeItem(i.product_id, i.size, i.color)}
                          className="text-xs underline opacity-60 hover:opacity-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#F3F4F6] px-6 py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Subtotal</span>
                <span className="font-medium" data-testid="cart-subtotal">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs opacity-50">Shipping and taxes calculated at checkout.</p>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                data-testid="cart-checkout-btn"
                className="block text-center bg-[#111] text-white py-4 overline hover:bg-[#333] transition"
              >
                Checkout →
              </Link>
              <button
                onClick={() => setOpen(false)}
                data-testid="cart-continue-shopping"
                className="w-full text-center overline opacity-70 hover:opacity-100"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
