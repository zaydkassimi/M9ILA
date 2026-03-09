"use client";

import { useMemo, useState } from "react";
import { menuData } from "@/lib/menuData";
import MenuCard from "./MenuCard";
import { motion, AnimatePresence } from "framer-motion";

type MenuProps = {
  lang: "fr" | "ar";
};

export default function Menu({ lang }: MenuProps) {
  const [activeCategory, setActiveCategory] = useState(menuData[0].id);

  const t = {
    fr: {
      title: "Notre Menu",
      subtitle: "Découvrez nos spécialités de la mer",
    },
    ar: {
      title: "قائمتنا",
      subtitle: "اكتشف تخصصاتنا البحرية",
    },
  };

  const currentCategoryObj = useMemo(
    () => menuData.find((c) => c.id === activeCategory),
    [activeCategory]
  );

  return (
    <section id="menu" className="py-24 bg-gray-50 bg-opacity-80" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-black text-dark mb-4 ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}
          >
            {t[lang].title}
          </motion.h2>
          <div className="w-24 h-1 bg-flame-orange mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600">{t[lang].subtitle}</p>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-4 mb-12 pb-4 justify-start md:justify-center">
          {menuData.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-primary text-white shadow-xl shadow-primary/30 transform -translate-y-1"
                  : "bg-white text-dark hover:bg-flame-yellow/20 hover:text-primary shadow-sm"
              } ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}
            >
              {lang === "ar" ? category.titleAr : category.titleFr}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {currentCategoryObj?.items.map((item) => (
                <MenuCard key={item.id} item={item} lang={lang} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
