"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type GalleryProps = {
  lang: "fr" | "ar";
};

export default function Gallery({ lang }: GalleryProps) {
  const images = [
    { id: 102, title: "Plateau Royal" },
    { id: 292, title: "Moules Fraîches" },
    { id: 431, title: "Crevettes Grillées" },
    { id: 493, title: "Calmar Frit" },
    { id: 824, title: "Homard" },
    { id: 835, title: "Sandwich Gourmet" },
  ];

  const t = {
    fr: {
      title: "Galerie Instagram",
      subtitle: "Suivez-nous @m9ila_com pour plus de gourmandises",
      follow: "Suivez-nous sur Instagram",
    },
    ar: {
      title: "معرض الصور",
      subtitle: "تابعونا على @m9ila_com للمزيد من الشهيوات",
      follow: "تابعونا على انستغرام",
    },
  };

  return (
    <section id="gallery" className="py-24 bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
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
          <div className="w-24 h-1 bg-flame-yellow mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600">{t[lang].subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer shadow-lg"
            >
              <Image
                src={`https://picsum.photos/id/${img.id}/800/800`}
                alt={img.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-bold text-lg">{img.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <motion.a
            href="https://instagram.com/m9ila_com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-flame-orange text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all text-xl"
          >
            <span className="text-2xl">📸</span>
            {t[lang].follow}
          </motion.a>
        </div>
      </div>
    </section>
  );
}
