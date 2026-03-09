"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type HeroProps = {
  lang: "fr" | "ar";
};

export default function Hero({ lang }: HeroProps) {
  const t = {
    fr: {
      tagline: "La Saveur Enflammée de la Mer",
      menuBtn: "Voir le Menu",
      orderBtn: "Commander",
    },
    ar: {
      tagline: "أكلة البحر الملتهبة",
      menuBtn: "عرض القائمة",
      orderBtn: "اطلب الآن",
    },
  };

  return (
    <section 
      id="home"
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-flame-orange to-flame-yellow"
    >
      {/* Flame styling backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-0" />
      
      {/* Animated glowing orbs for fire effect */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-flame-yellow/40 rounded-full mix-blend-overlay filter blur-3xl animate-flame" />
      <div className="absolute top-1/4 left-1/2 w-64 h-64 bg-primary/60 rounded-full mix-blend-overlay filter blur-3xl animate-flame animation-delay-200" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-flame-orange/50 rounded-full mix-blend-overlay filter blur-3xl animate-flame animation-delay-500" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Image
            src="/images/navbar%20-%20dark%20(transparent)@4x.png"
            alt="M9ila Logo"
            width={400}
            height={200}
            className="w-64 md:w-96 drop-shadow-2xl"
            priority
          />
        </motion.div>

        <motion.h1 
          className={`text-4xl md:text-6xl font-black text-white mb-10 drop-shadow-lg max-w-3xl ${
            lang === "ar" ? "font-tajawal leading-tight" : "font-montserrat leading-tight"
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t[lang].tagline}
        </motion.h1>

        <motion.div
          className="flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a 
            href="#menu"
            className="px-8 py-4 bg-white text-primary font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {t[lang].menuBtn}
          </a>
          <a 
            href="#delivery"
            className="px-8 py-4 bg-dark text-white font-bold text-lg rounded-full shadow-xl hover:bg-black transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {t[lang].orderBtn} 🛵
          </a>
        </motion.div>
      </div>

      {/* Custom decorative divider right at bottom of hero */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-12 md:h-20 fill-background">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C79.86,122.3,165.7,114.6,244.6,96.6,270.62,90.71,296.84,83,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
}
