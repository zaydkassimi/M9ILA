"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import About from "@/components/About";
import Delivery from "@/components/Delivery";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import AIChatBot from "@/components/AIChatBot";

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<"fr" | "ar">("fr");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => {
      setSettings(data);
      if (data.language_mode === "ar") setLang("ar");
    }).catch(() => {});
  }, []);

  const languageMode = settings.language_mode || "both";

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar lang={lang} setLang={setLang} languageMode={languageMode} settings={settings} />
      <Hero lang={lang} settings={settings} />
      <About lang={lang} settings={settings} />
      <Menu lang={lang} />
      <Delivery lang={lang} settings={settings} />
      <Gallery lang={lang} settings={settings} />
      <Testimonials lang={lang} />
      {settings.contact_form_enabled === "true" && <ContactForm lang={lang} />}
      <Footer lang={lang} settings={settings} />
      {settings.ai_enabled === "true" && (
        <AIChatBot lang={lang} welcomeMessage={lang === "ar" ? settings.ai_welcome_ar : settings.ai_welcome_fr} settings={settings} />
      )}
    </main>
  );
}
