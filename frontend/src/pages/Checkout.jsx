import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../lib/store";
import { toast } from "sonner";

const STEPS = ["Shipping", "Payment", "Review"];

export default function Checkout() {
  const items = useCart((s) => s.items);
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState({});
  const [shipping, setShipping] = useState({
    full_name: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "United States", phone: "",
  });
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!items.length) nav("/shop");
    const ids = [...new Set(items.map((i) => i.product_id))];
    Promise.all(ids.map((id) => api.get(`/products/${id}`).then((r) => r.data).catch(() => null)))
      .then((res) => {
        const map = {}; res.forEach((p) => p && (map[p.id] = p));
        setProducts(map);
      });
  }, [items.length]); // eslint-disable-line

  const subtotal = items.reduce((s, i) => s + ((products[i.product_id]?.price || 0) * i.quantity), 0);
  const shippingCost = subtotal >= 150 ? 0 : 12;
  const discount = couponApplied ? Math.round(subtotal * couponApplied.discount_percent) / 100 : 0;
  const total = subtotal + shippingCost - discount;

  const applyCoupon = async () => {
    if (!coupon) return;
    try {
      const r = await api.get(`/coupons/validate/${coupon.toUpperCase()}`);
      setCouponApplied(r.data);
      toast.success(`Code applied: ${r.data.discount_percent}% off`);
    } catch {
      toast.error("Invalid code");
      setCouponApplied(null);
    }
  };

  const validShipping = shipping.full_name && shipping.line1 && shipping.city && shipping.state && shipping.postal_code && shipping.phone;

  const placeOrder = async () => {
    setLoading(true);
    try {
      const r = await api.post("/checkout/session", {
        items, shipping_address: shipping, coupon_code: couponApplied?.code || null,
        origin_url: window.location.origin,
      });
      window.location.href = r.data.url;
    } catch (e) {
      toast.error(e.response?.data?.detail || "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <main data-testid="checkout-page" className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl mb-8">Checkout</h1>
          <div className="flex gap-8 border-b border-[#F3F4F6] pb-6">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-3 ${i <= step ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-6 h-6 flex items-center justify-center text-[10px] ${i < step ? "bg-[#111] text-white" : i === step ? "border border-[#111]" : "border border-[#F3F4F6]"}`}>
                  {i < step ? <Check size={12}/> : i+1}
                </div>
                <span className="overline">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-16">
          <div>
            {step === 0 && (
              <div data-testid="step-shipping" className="space-y-5 fade-in">
                <h2 className="font-display text-2xl mb-6">Shipping Details</h2>
                {[
                  ["full_name", "Full name", "col-span-2"],
                  ["line1", "Address line 1", "col-span-2"],
                  ["line2", "Address line 2 (optional)", "col-span-2"],
                  ["city", "City", ""],
                  ["state", "State / Region", ""],
                  ["postal_code", "Postal code", ""],
                  ["country", "Country", ""],
                  ["phone", "Phone", "col-span-2"],
                ].reduce((rows, _, i, arr) => i % 2 === 0 ? [...rows, arr.slice(i, i+2)] : rows, []).map((row, ri) => (
                  <div key={ri} className="grid grid-cols-2 gap-4">
                    {row.map(([k, label, span]) => (
                      <input
                        key={k}
                        data-testid={`ship-${k}`}
                        placeholder={label}
                        value={shipping[k]}
                        onChange={(e) => setShipping({ ...shipping, [k]: e.target.value })}
                        className={`bg-transparent border-b border-[#F3F4F6] focus:border-[#111] py-3 outline-none text-sm transition ${span}`}
                      />
                    ))}
                  </div>
                ))}
                <button
                  data-testid="to-payment"
                  disabled={!validShipping}
                  onClick={() => setStep(1)}
                  className="bg-[#111] text-white py-4 px-8 overline disabled:opacity-30 hover:bg-[#333] transition mt-6"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 1 && (
              <div data-testid="step-payment" className="space-y-6 fade-in">
                <h2 className="font-display text-2xl mb-4">Payment</h2>
                <div className="bg-[#FAFAFA] p-6 border border-[#F3F4F6]">
                  <p className="overline mb-2">Secure Stripe Checkout</p>
                  <p className="text-sm opacity-70">You'll be redirected to our secure payment partner Stripe to complete your purchase. All major cards accepted.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="border border-[#111] py-4 px-8 overline hover:bg-[#111] hover:text-white transition" data-testid="back-shipping">← Back</button>
                  <button onClick={() => setStep(2)} className="flex-1 bg-[#111] text-white py-4 overline hover:bg-[#333] transition" data-testid="to-review">Review Order →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div data-testid="step-review" className="space-y-6 fade-in">
                <h2 className="font-display text-2xl mb-4">Review your order</h2>
                <div className="border-t border-[#F3F4F6]">
                  {items.map((i) => {
                    const p = products[i.product_id]; if (!p) return null;
                    return (
                      <div key={`${i.product_id}-${i.size}-${i.color}`} className="flex gap-4 py-4 border-b border-[#F3F4F6]">
                        <img src={p.images?.[0]} className="w-16 h-20 object-cover" alt={p.name} />
                        <div className="flex-1 text-sm">
                          <p className="font-medium">{p.name}</p>
                          <p className="overline opacity-60 mt-1">{i.color} · {i.size} · Qty {i.quantity}</p>
                        </div>
                        <p className="text-sm">${(p.price * i.quantity).toFixed(0)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm space-y-1 pt-2">
                  <p className="overline opacity-60">Shipping to</p>
                  <p>{shipping.full_name}</p>
                  <p className="opacity-70">{shipping.line1}{shipping.line2 ? `, ${shipping.line2}`: ""}, {shipping.city}, {shipping.state} {shipping.postal_code}</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStep(1)} className="border border-[#111] py-4 px-8 overline hover:bg-[#111] hover:text-white transition">← Back</button>
                  <button
                    data-testid="place-order"
                    disabled={loading}
                    onClick={placeOrder}
                    className="flex-1 bg-[#111] text-white py-4 overline hover:bg-[#333] transition disabled:opacity-50"
                  >
                    {loading ? "Redirecting to Stripe..." : `Pay $${total.toFixed(2)} →`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="bg-[#FAFAFA] p-8 self-start">
            <p className="overline mb-6">Order Summary</p>
            <div className="space-y-3 mb-6">
              {items.map((i) => {
                const p = products[i.product_id]; if (!p) return null;
                return (
                  <div key={`${i.product_id}-${i.size}-${i.color}`} className="flex justify-between text-xs">
                    <span className="opacity-70 truncate">{p.name} × {i.quantity}</span>
                    <span>${(p.price * i.quantity).toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#E5E7EB] pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="opacity-70">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="opacity-70">Shipping</span><span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="opacity-70">Discount</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-medium text-base pt-2 border-t border-[#E5E7EB]"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            {/* Coupon */}
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <p className="overline mb-3">Promo code</p>
              <div className="flex gap-2">
                <input
                  data-testid="coupon-input"
                  placeholder="WELCOME10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#111]"
                />
                <button data-testid="coupon-apply" onClick={applyCoupon} className="overline border border-[#111] px-4 hover:bg-[#111] hover:text-white transition">Apply</button>
              </div>
              {couponApplied && <p className="text-xs mt-2 opacity-70">✓ {couponApplied.code} applied</p>}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
