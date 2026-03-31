"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Flame, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#CC0000] via-[#FF6600] to-[#FFD700]">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FFD700]/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/30 shadow-2xl">
              <Flame className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
              M9ila<span className="text-[#FFD700]">.</span>
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-md">
              Espace d&apos;administration
            </p>
            <p className="text-white/60 mt-2">
              Gérez votre restaurant en toute simplicité
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 flex items-center gap-8 text-white/60 text-sm"
          >
            <div className="text-center">
              <div className="text-3xl font-black text-white">22+</div>
              <div>Produits</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">6</div>
              <div>Catégories</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">24/7</div>
              <div>Accès</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#CC0000] to-[#FF6600] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#CC0000]/30">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">M9ila Admin</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-500 mt-1">Entrez vos identifiants pour accéder</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@m9ila.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/10 focus:bg-white transition-all placeholder:text-gray-400"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/10 focus:bg-white transition-all placeholder:text-gray-400"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#CC0000] to-[#E50000] hover:from-[#B00000] hover:to-[#CC0000] text-white font-bold rounded-xl shadow-lg shadow-[#CC0000]/30 hover:shadow-[#CC0000]/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} M9ila — Tous droits réservés
          </p>
        </motion.div>
      </div>
    </div>
  );
}
