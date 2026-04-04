"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Product = {
  id: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  price: number;
  image: string;
  emoji: string;
  categoryId: string;
  isAvailable: boolean;
  sortOrder: number;
  category: { nameFr: string; nameAr: string; slug: string };
};

type Category = {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  isActive: boolean;
};

type MenuProps = {
  lang: "fr" | "ar";
};

export default function Menu({ lang }: MenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const t = {
    fr: {
      title: "Notre Menu",
      subtitle: "Découvrez nos spécialités de la mer",
      loading: "Chargement du menu...",
    },
    ar: {
      title: "قائمتنا",
      subtitle: "اكتشف تخصصاتنا البحرية",
      loading: "جاري تحميل القائمة...",
    },
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([cats, prods]) => {
        const activeCats = cats.filter((c: Category) => c.isActive);
        setCategories(activeCats);
        setProducts(prods);
        if (activeCats.length > 0) setActiveCategory(activeCats[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentProducts = products.filter(
    (p) => p.categoryId === activeCategory && p.isAvailable
  );

  if (loading) {
    return (
      <section id="menu" className="py-24 bg-gray-50 bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-500">{t[lang].loading}</p>
        </div>
      </section>
    );
  }

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

        <div className="flex overflow-x-auto gap-3 mb-12 pb-4 px-1 snap-x snap-mandatory md:justify-center md:snap-none">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-primary text-white shadow-xl shadow-primary/30 transform -translate-y-1"
                  : "bg-white text-dark hover:bg-flame-yellow/20 hover:text-primary shadow-sm"
              } ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}
            >
              {lang === "ar" ? category.nameAr : category.nameFr}
            </button>
          ))}
        </div>

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
              {currentProducts.map((item) => (
                <MenuCard key={item.id} item={item} lang={lang} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

type MenuCardProps = {
  item: Product;
  lang: "fr" | "ar";
};

function MenuCard({ item, lang }: MenuCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-flame-orange/20 transition-all duration-300 flex flex-col h-full"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="relative h-40 sm:h-48 w-full bg-gray-100 overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={lang === "ar" ? item.nameAr : item.nameFr}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : item.emoji ? (
          <div className="w-full h-full bg-gradient-to-br from-brand-bg to-flame-orange flex items-center justify-center text-6xl">
            {item.emoji}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-bg to-flame-orange flex items-center justify-center text-4xl font-bold text-white">
            {lang === "ar" ? item.nameAr : item.nameFr}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-primary shadow-sm">
          {item.price} MAD
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className={`text-xl font-bold text-dark ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
            {lang === "ar" ? item.nameAr : item.nameFr}
          </h3>
          {item.emoji && <span className="text-2xl" aria-hidden="true">{item.emoji}</span>}
        </div>
        {(lang === "ar" ? item.descriptionAr : item.descriptionFr) && (
          <p className="text-sm text-gray-500 mt-2">
            {lang === "ar" ? item.descriptionAr : item.descriptionFr}
          </p>
        )}
      </div>
    </motion.div>
  );
}
