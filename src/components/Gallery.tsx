"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type GalleryImage = {
  url: string;
  alt: string;
};

type GalleryProps = {
  lang: "fr" | "ar";
  settings?: Record<string, string>;
};

const DEFAULT_IMAGES: GalleryImage[] = [
  { url: "https://picsum.photos/id/102/800/800", alt: "Plateau Royal" },
  { url: "https://picsum.photos/id/292/800/800", alt: "Moules Fraîches" },
  { url: "https://picsum.photos/id/431/800/800", alt: "Crevettes Grillées" },
  { url: "https://picsum.photos/id/493/800/800", alt: "Calmar Frit" },
  { url: "https://picsum.photos/id/824/800/800", alt: "Homard" },
  { url: "https://picsum.photos/id/835/800/800", alt: "Sandwich Gourmet" },
];

export default function Gallery({ lang, settings }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (settings?.gallery_images) {
      try {
        const parsed = JSON.parse(settings.gallery_images) as GalleryImage[];
        const active = parsed.filter((img) => img.url);
        if (active.length > 0) {
          setImages(active);
          return;
        }
      } catch {
        // fall through to defaults
      }
    }
    setImages(DEFAULT_IMAGES);
  }, [settings?.gallery_images]);

  const instagramUrl = settings?.instagram_url || "https://instagram.com/m9ila_com";

  const t = {
    fr: {
      title: "Galerie",
      subtitle: "Découvrez nos plats en images",
      follow: "Suivez-nous sur Instagram",
    },
    ar: {
      title: "معرض الصور",
      subtitle: "اكتشف أطباقنا بالصور",
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
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer shadow-lg"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-bold text-lg">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <motion.a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-flame-orange text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all text-base sm:text-xl"
          >
            <span className="text-2xl">📸</span>
            {t[lang].follow}
          </motion.a>
        </div>
      </div>
    </section>
  );
}
