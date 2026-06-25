import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../lib/store";
import { toast } from "sonner";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/register", form);
      login(r.data.user, r.data.token);
      toast.success(`Welcome to SOPHIE, ${r.data.user.name}`);
      nav("/account");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <main data-testid="register-page" className="pt-40 pb-32 px-6 grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
      <div className="hidden lg:block aspect-[3/4] overflow-hidden">
        <img src="https://images.pexels.com/photos/31042862/pexels-photo-31042862.jpeg?auto=compress&w=940" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-center">
        <p className="overline opacity-60 mb-3">Join the maison</p>
        <h1 className="font-display text-4xl md:text-5xl mb-10">Create Account</h1>
        <form onSubmit={submit} className="space-y-6">
          {["name","email","password"].map((k) => (
            <div key={k}>
              <label className="overline opacity-60">{k}</label>
              <input
                data-testid={`reg-${k}`}
                type={k === "password" ? "password" : k === "email" ? "email" : "text"}
                required
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full bg-transparent border-b border-[#F3F4F6] focus:border-[#111] py-3 outline-none"
              />
            </div>
          ))}
          <button data-testid="register-submit" disabled={loading} className="w-full bg-[#111] text-white py-4 overline hover:bg-[#333] transition disabled:opacity-50">
            {loading ? "Creating..." : "Create account →"}
          </button>
          <p className="text-xs text-center opacity-60">
            Already a member? <Link to="/login" className="underline">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
