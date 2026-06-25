import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/store";
import api from "../lib/api";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export default function Admin() {
  const user = useAuth((s) => s.user);
  const nav = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [chart, setChart] = useState([]);

  useEffect(() => {
    if (!user || !user.is_admin) { nav("/login"); return; }
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/admin/orders").then((r) => setOrders(r.data));
    api.get("/products", { params: { limit: 100 } }).then((r) => setProducts(r.data.items));
    api.get("/admin/customers").then((r) => setCustomers(r.data));
    api.get("/admin/revenue-chart").then((r) => setChart(r.data));
  }, [user]); // eslint-disable-line

  if (!user?.is_admin) return null;

  const TABS = ["dashboard", "orders", "products", "customers", "coupons", "analytics"];

  return (
    <main data-testid="admin-page" className="pt-32 pb-24 px-6 md:px-12 lg:px-16">
      <div className="mb-10">
        <p className="overline opacity-60 mb-2">SOPHIE Atelier</p>
        <h1 className="font-display text-4xl md:text-5xl">Admin Dashboard</h1>
      </div>

      <div className="border-b border-[#F3F4F6] mb-10 flex gap-8 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            data-testid={`admin-tab-${t}`}
            onClick={() => setTab(t)}
            className={`overline pb-4 border-b-2 -mb-px transition capitalize ${tab === t ? "border-[#111]" : "border-transparent opacity-60 hover:opacity-100"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "dashboard" && stats && (
        <div className="space-y-10 fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ["Revenue", `$${stats.revenue.toFixed(0)}`],
              ["Orders", stats.total_orders],
              ["Products", stats.total_products],
              ["Customers", stats.total_customers],
            ].map(([k, v]) => (
              <div key={k} className="border border-[#F3F4F6] p-6">
                <p className="overline opacity-60 mb-3">{k}</p>
                <p className="font-display text-3xl">{v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="overline mb-4">Recent Orders</p>
            <div className="border-t border-[#F3F4F6]">
              {stats.recent_orders.slice(0, 5).map((o) => (
                <div key={o.id} className="grid grid-cols-4 md:grid-cols-5 gap-4 py-4 border-b border-[#F3F4F6] text-sm">
                  <span>#{o.id.slice(0,8).toUpperCase()}</span>
                  <span className="opacity-70">{o.user_email || "Guest"}</span>
                  <span className="opacity-70 hidden md:inline">{new Date(o.created_at).toLocaleDateString()}</span>
                  <span>${o.total.toFixed(2)}</span>
                  <span className="overline">{o.payment_status}</span>
                </div>
              ))}
            </div>
          </div>

          {stats.low_stock.length > 0 && (
            <div>
              <p className="overline mb-4 text-red-600">Low Stock Alerts</p>
              <div className="grid md:grid-cols-3 gap-4">
                {stats.low_stock.map((p) => (
                  <div key={p.id} className="border border-red-200 p-4 text-sm">
                    <p className="font-medium">{p.name}</p>
                    <p className="opacity-60 text-xs mt-1">{p.stock} in stock</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="border-t border-[#F3F4F6] fade-in" data-testid="admin-orders">
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 py-4 border-b border-[#F3F4F6] text-sm">
              <span>#{o.id.slice(0,8).toUpperCase()}</span>
              <span className="opacity-70">{o.user_email || "Guest"}</span>
              <span className="opacity-70 hidden md:inline">{new Date(o.created_at).toLocaleDateString()}</span>
              <span>{o.items.length} items</span>
              <span>${o.total.toFixed(2)}</span>
              <span className="overline">{o.payment_status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 fade-in">
          {products.map((p) => (
            <div key={p.id} className="border border-[#F3F4F6]">
              <img src={p.images?.[0]} className="w-full aspect-[3/4] object-cover" alt={p.name} />
              <div className="p-4 text-sm">
                <p className="font-medium">{p.name}</p>
                <div className="flex justify-between mt-2 opacity-70 text-xs">
                  <span>${p.price}</span>
                  <span>Stock: {p.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "customers" && (
        <div className="border-t border-[#F3F4F6] fade-in" data-testid="admin-customers">
          {customers.map((c) => (
            <div key={c.id} className="grid grid-cols-3 gap-4 py-4 border-b border-[#F3F4F6] text-sm">
              <span>{c.name}</span>
              <span className="opacity-70">{c.email}</span>
              <span className="opacity-70">{c.is_admin ? "Admin" : "Customer"}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "coupons" && (
        <div className="fade-in">
          <p className="opacity-60 mb-6 text-sm">Active coupon codes</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[["WELCOME10","10%"], ["SOPHIE20","20%"]].map(([code, off]) => (
              <div key={code} className="border border-[#F3F4F6] p-6 flex justify-between items-center">
                <div>
                  <p className="font-display text-2xl">{code}</p>
                  <p className="overline opacity-60 mt-1">{off} off</p>
                </div>
                <span className="overline text-green-600">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="fade-in">
          <p className="overline mb-6">Revenue (last 30 days)</p>
          <div className="h-80 border border-[#F3F4F6] p-6">
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="opacity-50 text-sm">No paid orders yet. Once payments come in, you'll see the trend here.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
