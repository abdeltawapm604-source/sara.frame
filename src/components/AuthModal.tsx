"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "signin" | "signup";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword("");
  };

  const handleClose = () => {
    setError(null);
    setNotice(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        handleClose();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setNotice("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب إذا لزم الأمر.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-[#362C28]/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            className="relative w-full max-w-sm bg-white rounded-[10px] shadow-[0_20px_60px_rgba(54,44,40,0.25)] overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 text-[#362C28]/40 hover:text-[#362C28] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="px-7 pt-9 pb-7 text-center border-b border-[#362C28]/10">
              <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gradient-to-tr from-[#8C6A53] to-[#D9CFC1] p-[2px]">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <span className="font-serif text-xs text-[#362C28]">S.</span>
                </div>
              </div>
              <h2 className="font-serif text-xl text-[#362C28]">
                {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
              </h2>
              <p className="font-sans text-xs text-[#362C28]/55 mt-1.5">
                سجّل دخولك للإعجاب والتعليق وحفظ الصور
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#362C28]/50">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#FCFAF8] border border-[#362C28]/15 rounded-[6px] outline-none focus:border-[#8C6A53] transition-colors text-[#362C28]"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#362C28]/50">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#FCFAF8] border border-[#362C28]/15 rounded-[6px] outline-none focus:border-[#8C6A53] transition-colors text-[#362C28]"
                  placeholder="••••••••"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>

              {error && (
                <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-[6px] px-3 py-2">
                  {error}
                </p>
              )}
              {notice && (
                <p className="text-[12px] text-[#5B7A5B] bg-[#EEF3EC] border border-[#D8E5D4] rounded-[6px] px-3 py-2">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full flex items-center justify-center gap-2 bg-[#362C28] hover:bg-[#4a3c36] text-white text-sm font-medium py-2.5 rounded-[6px] transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "signin" ? "دخول" : "إنشاء الحساب"}
              </button>
            </form>

            <div className="px-7 pb-7 text-center">
              <button
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="font-sans text-[12.5px] text-[#8C6A53] hover:text-[#362C28] transition-colors"
              >
                {mode === "signin"
                  ? "معندكش حساب؟ سجّل دلوقتي"
                  : "عندك حساب بالفعل؟ سجّل دخولك"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
