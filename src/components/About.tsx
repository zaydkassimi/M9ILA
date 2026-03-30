"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, ShieldCheck, Zap } from "lucide-react";

type AboutProps = {
  lang: "fr" | "ar";
  settings?: Record<string, string>;
};

export default function About({ lang }: AboutProps) {
  const t = {
    fr: {
      title: "À Propos de M9ila",
      story:
        "Fondé en 2020 au cœur de Maarif, M9ila est le fast food incontournable de Casablanca. Burgers, sandwichs, fruits de mer, tajines — tout ce dont vous avez envie, préparé avec passion.",
      stats: {
        followers: "21K+ Followers",
        since: "Depuis 2020",
        location: "Maarif Casablanca",
      },
      values: {
        freshness: "Fraîcheur Garantie",
        quality: "Haute Qualité",
        speed: "Service Rapide",
      },
    },
    ar: {
      title: "عن مقيلة",
      story:
        "تأسست مقيلة عام 2020 في قلب معاريف، الدار البيضاء. فاست فود متكامل: ساندويتش، فواكه البحر، طاجين وأكثر — كل ما تشتهيه، محضّر بشغف.",
      stats: {
        followers: "+21 ألف متابع",
        since: "منذ 2020",
        location: "المعاريف الدار البيضاء",
      },
      values: {
        freshness: "ضمان الطراوة",
        quality: "جودة عالية",
        speed: "خدمة سريعة",
      },
    },
  };

  const currentT = t[lang];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-flame-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left/Right Text Content */}
          <motion.div
            initial={{ opacity: 0, x: lang === "ar" ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-4xl md:text-5xl font-black text-dark mb-6 ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
              {currentT.title}
              <span className="block w-24 h-2 bg-gradient-to-r from-primary to-flame-orange mt-4 rounded-full"></span>
            </h2>
            <p className={`text-lg text-gray-700 leading-relaxed mb-8 ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
              {currentT.story}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="text-center p-4 bg-gray-50 rounded-2xl border-b-4 border-primary">
                <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="font-bold text-dark text-sm leading-tight">{currentT.stats.followers}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl border-b-4 border-flame-orange">
                <Clock className="w-8 h-8 mx-auto text-flame-orange mb-2" />
                <p className="font-bold text-dark text-sm leading-tight">{currentT.stats.since}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl border-b-4 border-flame-yellow">
                <MapPin className="w-8 h-8 mx-auto text-flame-yellow mb-2" />
                <p className="font-bold text-dark text-sm leading-tight">{currentT.stats.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-blue-500 w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-dark">{currentT.values.freshness}</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-green-500 w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-dark">{currentT.values.quality}</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-flame-yellow/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="text-flame-orange w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-dark">{currentT.values.speed}</h4>
              </div>
            </div>
          </motion.div>

          {/* Right/Left Image Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Split layout for a dynamic restaurant image collage vibe */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-2 bg-white">
              <div className="relative col-span-2 row-span-1 rounded-2xl overflow-hidden">
                <Image src="https://picsum.photos/id/835/600/400" alt="Restaurant interior" fill className="object-cover" />
              </div>
              <div className="relative rounded-2xl overflow-hidden flex items-center justify-center">
                <Image 
                  src="/images/navbar%20-%20primary%20(transparent)@4x.png" 
                  alt="M9ila Brand" 
                  width={180} 
                  height={60} 
                  className="h-[60px] w-auto object-contain" 
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden">
                <Image src="https://picsum.photos/id/292/400/400" alt="Fresh food prep" fill className="object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
