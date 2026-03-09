"use client";

import { MenuItem } from "@/lib/menuData";
import { motion } from "framer-motion";
import Image from "next/image";

type MenuCardProps = {
  item: MenuItem;
  lang: "fr" | "ar";
};

export default function MenuCard({ item, lang }: MenuCardProps) {
  const t = {
    fr: { add: "Ajouter" },
    ar: { add: "إضافة" },
  };

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-flame-orange/20 transition-all duration-300 flex flex-col h-full"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {item.imagePlaceholderId ? (
          <Image
            src={`https://picsum.photos/id/${item.imagePlaceholderId}/500/300`}
            alt={lang === "ar" ? item.nameAr : item.nameFr}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-bg to-flame-orange flex items-center justify-center text-6xl">
            {item.emoji}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-primary shadow-sm">
          {item.price} MAD
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-xl font-bold text-dark ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
            {lang === "ar" ? item.nameAr : item.nameFr}
          </h3>
          <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
        </div>
        
        <div className="mt-auto pt-4">
          <button className="w-full py-3 bg-gray-50 text-dark font-bold rounded-xl border-2 border-transparent group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_15px_rgba(204,0,0,0.4)] transition-all duration-300">
            {t[lang].add}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
