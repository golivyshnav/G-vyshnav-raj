import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/store";
import api from "../lib/api";

export default function Account() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) { nav("/login"); return; }
    api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
  }, [user]); // eslint-disable-line

  if (!user) return null;

  return (
    <main data-testid="account-page" className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
        <div>
          <p className="overline opacity-60 mb-3">Account</p>
          <h1 className="font-display text-4xl md:text-5xl">Hello, {user.name}</h1>
          <p className="opacity-60 text-sm mt-2">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {user.is_admin && <Link to="/admin" className="overline border border-[#111] px-5 py-3 hover:bg-[#111] hover:text-white transition">Admin Panel</Link>}
          <button data-testid="logout-btn" onClick={() => { logout(); nav("/"); }} className="overline underline opacity-70">Sign out</button>
        </div>
      </div>

      <h2 className="overline mb-6">Order History</h2>
      {orders.length === 0 ? (
        <p className="opacity-60 text-sm">No orders yet. <Link to="/shop" className="underline">Begin shopping →</Link></p>
      ) : (
        <div className="border-t border-[#F3F4F6]">
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 py-5 border-b border-[#F3F4F6] text-sm">
              <div><p className="overline opacity-60">Order</p><p>#{o.id.slice(0,8).toUpperCase()}</p></div>
              <div><p className="overline opacity-60">Date</p><p>{new Date(o.created_at).toLocaleDateString()}</p></div>
              <div><p className="overline opacity-60">Items</p><p>{o.items.length}</p></div>
              <div><p className="overline opacity-60">Total</p><p>${o.total.toFixed(2)}</p></div>
              <div><p className="overline opacity-60">Status</p><p className="uppercase text-xs">{o.payment_status}</p></div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
