"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, Globe } from "lucide-react";

type NavbarProps = {
  lang: "fr" | "ar";
  setLang: (l: "fr" | "ar") => void;
};

export default function Navbar({ lang, setLang }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = {
    fr: {
      home: "Accueil",
      menu: "Menu",
      about: "À propos",
      delivery: "Livraison",
      contact: "Contact",
    },
    ar: {
      home: "الرئيسية",
      menu: "القائمة",
      about: "من نحن",
      delivery: "التوصيل",
      contact: "اتصل بنا",
    },
  };

  const navLinks = [
    { name: t[lang].home, href: "#home" },
    { name: t[lang].menu, href: "#menu" },
    { name: t[lang].about, href: "#about" },
    { name: t[lang].delivery, href: "#delivery" },
    { name: t[lang].contact, href: "#contact" },
  ];

  const logoSrc = isScrolled 
    ? "/images/navbar%20-%20primary%20(transparent)@4x.png" 
    : "/images/navbar%20-%20dark%20(transparent)@4x.png";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#home">
              <Image
                src={logoSrc}
                alt="M9ila Logo"
                width={120}
                height={40}
                className="h-8 md:h-10 w-auto object-contain transition-all duration-300"
                style={{ objectFit: "contain" }}
                priority
              />
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`font-semibold transition-colors duration-200 ${
                  isScrolled ? "text-dark hover:text-primary" : "text-white hover:text-flame-yellow"
                } ${lang === "ar" ? "font-tajawal ml-8 space-x-0" : "font-montserrat mr-8"}`}
              >
                {link.name}
              </a>
            ))}
            
            <button
              onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
              className={`flex items-center gap-2 font-bold px-3 py-1 rounded-full border-2 transition-colors ${
                isScrolled 
                  ? "border-primary text-primary hover:bg-primary hover:text-white" 
                  : "border-white text-white hover:bg-white hover:text-primary"
              }`}
            >
              <Globe size={18} />
              {lang === "fr" ? "AR" : "FR"}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={isScrolled ? "text-primary" : "text-white"}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-xl absolute top-full left-0 w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-bold text-dark hover:text-primary hover:bg-gray-50"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => {
                setLang(lang === "fr" ? "ar" : "fr");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-base font-bold text-primary hover:bg-gray-50 flex items-center gap-2"
            >
              <Globe size={20} />
              {lang === "fr" ? "Passez en Arabe (AR)" : "Passer au Français (FR)"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
