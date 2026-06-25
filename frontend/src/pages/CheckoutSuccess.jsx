import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../lib/store";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("polling");
  const [order, setOrder] = useState(null);
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const r = await api.get(`/checkout/status/${sessionId}`);
        if (r.data.payment_status === "paid") {
          setStatus("paid"); setOrder(r.data.order); clear(); return;
        }
        if (r.data.status === "expired") { setStatus("expired"); return; }
        if (attempts++ < 8) setTimeout(poll, 2000);
        else setStatus("timeout");
      } catch {
        if (attempts++ < 5) setTimeout(poll, 2000);
        else setStatus("error");
      }
    };
    poll();
  }, [sessionId]); // eslint-disable-line

  return (
    <main data-testid="success-page" className="pt-40 pb-32 px-6 min-h-[70vh] flex flex-col items-center justify-center text-center">
      {status === "polling" && (
        <>
          <Loader2 size={48} strokeWidth={1} className="animate-spin mb-8 opacity-60" />
          <h1 className="font-display text-3xl mb-2">Confirming your order…</h1>
          <p className="opacity-60">Please wait while we finalize your payment.</p>
        </>
      )}
      {status === "paid" && (
        <>
          <CheckCircle2 size={56} strokeWidth={1} className="mb-8" />
          <p className="overline opacity-60 mb-3">Thank you</p>
          <h1 className="font-display text-4xl md:text-5xl mb-4">Your order is confirmed</h1>
          <p className="opacity-70 max-w-md mb-2">A confirmation email is on its way.</p>
          {order && <p className="overline opacity-60 mb-10">Order #{order.id?.slice(0,8).toUpperCase()} · ${order.total?.toFixed(2)}</p>}
          <div className="flex gap-3">
            <Link to="/shop" className="bg-[#111] text-white px-8 py-4 overline hover:bg-[#333] transition">Continue shopping →</Link>
            <Link to="/account" className="border border-[#111] px-8 py-4 overline hover:bg-[#111] hover:text-white transition">View orders</Link>
          </div>
        </>
      )}
      {(status === "expired" || status === "timeout" || status === "error") && (
        <>
          <h1 className="font-display text-3xl mb-3">Payment unconfirmed</h1>
          <p className="opacity-70 mb-8">If you were charged, your order will appear in your account shortly.</p>
          <Link to="/cart" className="bg-[#111] text-white px-8 py-4 overline">Back to cart</Link>
        </>
      )}
    </main>
  );
}
