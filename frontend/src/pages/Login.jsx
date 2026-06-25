import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../lib/store";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/login", { email, password });
      login(r.data.user, r.data.token);
      toast.success(`Welcome back, ${r.data.user.name}`);
      nav(r.data.user.is_admin ? "/admin" : "/account");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    }
    setLoading(false);
  };

  return (
    <main data-testid="login-page" className="pt-40 pb-32 px-6 grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
      <div className="hidden lg:block aspect-[3/4] overflow-hidden">
        <img src="https://images.pexels.com/photos/27641318/pexels-photo-27641318.jpeg?auto=compress&w=940" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-center">
        <p className="overline opacity-60 mb-3">Account</p>
        <h1 className="font-display text-4xl md:text-5xl mb-10">Sign In</h1>
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="overline opacity-60">Email</label>
            <input data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-[#F3F4F6] focus:border-[#111] py-3 outline-none" />
          </div>
          <div>
            <label className="overline opacity-60">Password</label>
            <input data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-[#F3F4F6] focus:border-[#111] py-3 outline-none" />
          </div>
          <button data-testid="login-submit" disabled={loading} className="w-full bg-[#111] text-white py-4 overline hover:bg-[#333] transition disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in →"}
          </button>
          <p className="text-xs text-center opacity-60">
            New to SOPHIE? <Link to="/register" data-testid="login-register-link" className="underline">Create an account</Link>
          </p>
          <p className="text-xs text-center opacity-50 mt-8 pt-6 border-t border-[#F3F4F6]">
            Demo: demo@sophie.com / demo1234 · Admin: admin@sophie.com / admin1234
          </p>
        </form>
      </div>
    </main>
  );
}
