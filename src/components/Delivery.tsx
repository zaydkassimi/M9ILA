"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Smartphone, ChefHat, Bike } from "lucide-react";

type DeliveryProps = {
  lang: "fr" | "ar";
};

export default function Delivery({ lang }: DeliveryProps) {
  const t = {
    fr: {
      title: "Livraison Rapide",
      subtitle: "Savourez M9ila où que vous soyez à Casablanca",
      glovo: "Disponible sur Glovo",
      steps: [
        {
          id: 1,
          title: "Choisir",
          desc: "Sélectionnez vos plats préférés",
          Icon: Smartphone,
        },
        {
          id: 2,
          title: "Commander",
          desc: "On prépare avec passion",
          Icon: ChefHat,
        },
        {
          id: 3,
          title: "Livrer",
          desc: "C'est chaud et prêt !",
          Icon: Bike,
        },
      ],
      cta: "Appelez-nous",
    },
    ar: {
      title: "توصيل سريع",
      subtitle: "استمتع بمقيلة أينما كنت في الدار البيضاء",
      glovo: "متوفر على جلوفو",
      steps: [
        {
          id: 1,
          title: "اختر",
          desc: "حدد أطباقك المفضلة",
          Icon: Smartphone,
        },
        {
          id: 2,
          title: "اطلب",
          desc: "نحضرها بشغف",
          Icon: ChefHat,
        },
        {
          id: 3,
          title: "استلم",
          desc: "ساخنة وجاهزة!",
          Icon: Bike,
        },
      ],
      cta: "اتصل بنا",
    },
  };

  const currentT = t[lang];

  return (
    <section id="delivery" className="py-24 bg-dark relative" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-black text-white mb-4 ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}
          >
            {currentT.title}
          </motion.h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-300">{currentT.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 mb-16 relative">
          {/* Arrow connectors (only visible on md+) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-dark via-gray-600 to-dark z-0 border-t-2 border-dashed border-gray-600"></div>
          
          {currentT.steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-dark border-4 border-gray-700 group-hover:border-primary group-hover:bg-primary/20 flex items-center justify-center mb-6 transition-all duration-300 shadow-2xl">
                <step.Icon className="w-10 h-10 text-white group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
              </div>
              <h3 className={`text-2xl font-bold text-white mb-2 ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
                <span className="text-primary mr-2">0{step.id}.</span> {step.title}
              </h3>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-16">
          <Image 
            src="/images/navbar%20-%20dark%20(transparent)@4x.png" 
            alt="M9ila Logo" 
            width={180} 
            height={60} 
            className="h-[60px] w-auto object-contain opacity-90" 
            style={{ objectFit: "contain" }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <motion.a
            href="https://glovoapp.com"
            target="_blank"
            whileHover={{ scale: 1.05 }}
            className="bg-white border border-gray-200 w-64 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all"
          >
            <Image 
              src="/images/glovo.png" 
              width={120} 
              height={40} 
              alt="Glovo" 
              style={{ objectFit: "contain" }}
            />
          </motion.a>

          <motion.a
            href="tel:0520333555"
            whileHover={{ scale: 1.05 }}
            className="bg-primary text-white font-bold text-xl px-8 w-64 h-20 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 border-2 border-primary hover:bg-transparent transition-all"
          >
            {currentT.cta} <br/> 0520 333 555
          </motion.a>
        </div>

      </div>
    </section>
  );
}
