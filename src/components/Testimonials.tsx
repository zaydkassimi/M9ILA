"use client";

import { motion } from "framer-motion";
import { Star, MessageSquareQuote } from "lucide-react";

type TestimonialsProps = {
  lang: "fr" | "ar";
};

export default function Testimonials({ lang }: TestimonialsProps) {
  const reviews = {
    fr: [
      {
        name: "Yassine B.",
        comment: "Le plateau de fruits de mer était exceptionnel ! Très frais et bien assaisonné. Je recommande vivement.",
        rating: 5,
        date: "Il y a 2 jours",
      },
      {
        name: "Sara M.",
        comment: "Meilleur sandwich crevettes de Casablanca. Service rapide même en heure de pointe.",
        rating: 5,
        date: "Il y a 1 semaine",
      },
      {
        name: "Omar K.",
        comment: "Le tajine de calmar est une tuerie. Les saveurs sont authentiques. M9ila ne déçoit jamais.",
        rating: 4,
        date: "Il y a 3 jours",
      },
    ],
    ar: [
      {
        name: "يا سين ب.",
        comment: "طبق فواكه البحر كان استثنائياً! طازج جداً ومتبل جيداً. أنصح به بشدة.",
        rating: 5,
        date: "منذ يومين",
      },
      {
        name: "سارة م.",
        comment: "أفضل سندويش قمرون في الدار البيضاء. خدمة سريعة حتى في وقت الذروة.",
        rating: 5,
        date: "منذ أسبوع",
      },
      {
        name: "عمر ك.",
        comment: "طاجين الكلمار رائع جداً. النكهات أصلية. مقيلة لا تخيب الظن أبدا.",
        rating: 4,
        date: "منذ 3 أيام",
      },
    ],
  };

  const t = {
    fr: {
      title: "Ce qu'ils disent de nous",
      subtitle: "Avis de nos clients gourmets",
    },
    ar: {
      title: "ماذا يقولون عنا",
      subtitle: "آراء زبنائنا الأعزاء",
    },
  };

  return (
    <section id="testimonials" className="py-24 bg-gray-50 bg-opacity-80 relative overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Decorative quotes icons */}
      <MessageSquareQuote className="absolute top-20 left-10 w-40 h-40 text-primary/5 -rotate-12" />
      <MessageSquareQuote className="absolute bottom-20 right-10 w-40 h-40 text-primary/5 rotate-12" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews[lang].map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-xl relative"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < review.rating ? "fill-flame-yellow text-flame-yellow" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className={`text-lg text-gray-700 italic mb-6 leading-relaxed ${lang === "ar" ? "font-tajawal" : "font-montserrat"}`}>
                &quot;{review.comment}&quot;
              </p>
              <div className="flex items-center justify-between border-t pt-6">
                <span className="font-bold text-dark">{review.name}</span>
                <span className="text-sm text-gray-400">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
