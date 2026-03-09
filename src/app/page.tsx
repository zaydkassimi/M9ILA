"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import About from "@/components/About";
import Delivery from "@/components/Delivery";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  const [lang, setLang] = useState<"fr" | "ar">("fr");

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <About lang={lang} />
      <Menu lang={lang} />
      <Delivery lang={lang} />
      <Gallery lang={lang} />
      <Testimonials lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}
