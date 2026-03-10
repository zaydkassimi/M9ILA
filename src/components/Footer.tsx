"use client";

import Image from "next/image";
import { Instagram, Phone, MapPin, Mail, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

type FooterProps = {
  lang: "fr" | "ar";
};

export default function Footer({ lang }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const t = {
    fr: {
      address: "95 Boulevard Bir Anzarane, Maarif, Casablanca",
      phone: "0520 333 555",
      email: "contact@m9ila.com",
      rights: "© 2024 M9ila. Tous droits réservés.",
      quickLinks: "Liens Rapides",
      contactUs: "Contactez-nous",
      tagline: "Le Fast Food Incontournable de Casa 🔥",
    },
    ar: {
      address: "95 شارع بئرانزران، المعاريف، الدار البيضاء",
      phone: "0520 333 555",
      email: "contact@m9ila.com",
      rights: "© 2024 مقيلة. جميع الحقوق محفوظة.",
      quickLinks: "روابط سريعة",
      contactUs: "اتصل بنا",
      tagline: "أفضل فاست فود في كازا 🔥",
    },
  };

  const currentT = t[lang];

  return (
    <footer id="contact" className="bg-dark text-white pt-24 pb-10" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-1 border-b md:border-b-0 pb-8 md:pb-0 border-gray-800">
            <Image
              src="/images/navbar%20-%20dark%20(transparent)@4x.png"
              alt="M9ila Logo"
              width={150}
              height={50}
              className="h-[50px] w-auto object-contain mb-6"
              style={{ objectFit: "contain" }}
            />
            <p className="text-gray-400 mb-6 text-lg">
              {currentT.tagline}
            </p>
            <div className="flex gap-4">
              <motion.a 
                href="https://instagram.com/m9ila_com" 
                target="_blank"
                whileHover={{ y: -5, color: "#FF6600" }}
                className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </motion.a>
              <motion.a 
                href="tel:0520333555"
                whileHover={{ y: -5, color: "#CC0000" }}
                className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center transition-colors"
                aria-label="Phone"
              >
                <Phone size={24} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-b md:border-b-0 pb-8 md:pb-0 border-gray-800">
            <h3 className="text-xl font-bold mb-8 relative">
              {currentT.quickLinks}
              <span className="block w-10 h-1 bg-primary mt-2 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-gray-400 text-lg">
              <li><a href="#home" className="hover:text-primary transition-colors">Accueil</a></li>
              <li><a href="#menu" className="hover:text-primary transition-colors">Menu</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">À propos</a></li>
              <li><a href="#delivery" className="hover:text-primary transition-colors">Livraison</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="border-b md:border-b-0 pb-8 md:pb-0 border-gray-800">
            <h3 className="text-xl font-bold mb-8 relative">
              {currentT.contactUs}
              <span className="block w-10 h-1 bg-flame-orange mt-2 rounded-full"></span>
            </h3>
            <ul className="space-y-6 text-gray-400 text-lg">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary flex-shrink-0 mt-1" size={20} />
                <span>{currentT.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary flex-shrink-0" size={20} />
                <span>{currentT.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary flex-shrink-0" size={20} />
                <span>{currentT.email}</span>
              </li>
            </ul>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-1">
            <div className="w-full h-48 bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-flame-orange/20" />
              <div className="w-full h-full flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <Image 
                   src="https://picsum.photos/id/164/500/300" 
                   alt="Map Placeholder" 
                   fill 
                   className="object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-3 rounded-full shadow-xl">
                  <MapPin className="text-primary w-8 h-8" />
                </div>
              </div>
              <a 
                href="https://maps.google.com/?q=95+Boulevard+Bir+Anzarane,+Maarif,+Casablanca" 
                target="_blank" 
                className="absolute inset-0 z-10"
                aria-label="Open in Google Maps"
              ></a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-center md:text-left">
            {currentT.rights}
          </p>
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, backgroundColor: "#CC0000" }}
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-xl transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
