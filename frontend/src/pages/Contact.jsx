import { useState } from "react";
import api from "../lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent. We'll be in touch.");
      setForm({ name: "", email: "", message: "" });
    } catch { toast.error("Failed to send"); }
    setLoading(false);
  };

  return (
    <main data-testid="contact-page" className="pt-32 pb-24 px-6 md:px-12 lg:px-24 grid lg:grid-cols-2 gap-16">
      <div>
        <p className="overline opacity-60 mb-6">Contact</p>
        <h1 className="font-display text-5xl md:text-6xl mb-10">Speak to us directly.</h1>
        <div className="space-y-6 text-sm">
          <div>
            <p className="overline opacity-60 mb-2">Atelier</p>
            <p>14 Rue de Sévigné, 75004 Paris, France</p>
          </div>
          <div>
            <p className="overline opacity-60 mb-2">Client Care</p>
            <p>concierge@sophie.maison</p>
            <p>Mon — Fri, 10:00 — 18:00 CET</p>
          </div>
          <div>
            <p className="overline opacity-60 mb-2">Press</p>
            <p>press@sophie.maison</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6 self-start">
        <h2 className="font-display text-2xl mb-2">Send us a note</h2>
        <input data-testid="contact-name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-transparent border-b border-[#F3F4F6] focus:border-[#111] py-3 outline-none" />
        <input data-testid="contact-email" type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full bg-transparent border-b border-[#F3F4F6] focus:border-[#111] py-3 outline-none" />
        <textarea data-testid="contact-message" placeholder="Your message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="w-full bg-transparent border-b border-[#F3F4F6] focus:border-[#111] py-3 outline-none resize-none" />
        <button data-testid="contact-submit" disabled={loading} className="bg-[#111] text-white px-8 py-4 overline hover:bg-[#333] transition disabled:opacity-50">
          {loading ? "Sending..." : "Send Message →"}
        </button>
      </form>
    </main>
  );
}
