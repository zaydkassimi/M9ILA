import type { Metadata } from "next";
import { Tajawal, Montserrat, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "M9ila | مقيلة - Meilleur Fast Food à Casablanca | أفضل فاست فود في الدار البيضاء",
  description: "M9ila — Fast food complet à Maarif, Casablanca. Burgers, sandwichs, fruits de mer, tajines, salades. Livraison rapide via Glovo. مقيلة — فاست فود متكامل في معاريف، الدار البيضاء.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className={cn("font-sans", geist.variable)}>
      <body
        className={`${tajawal.variable} ${montserrat.variable} font-montserrat antialiased text-dark bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
