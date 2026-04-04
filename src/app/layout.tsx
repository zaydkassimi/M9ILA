import type { Metadata } from "next";
import { Tajawal, Montserrat } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

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

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "M9ila | مقيلة - Meilleur Fast Food à Casablanca | أفضل فاست فود في الدار البيضاء",
  description: "M9ila — Fast food complet à Maarif, Casablanca. Burgers, sandwichs, fruits de mer, tajines, salades. Livraison rapide via Glovo. مقيلة — فاست فود متكامل في معاريف، الدار البيضاء.",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "M9ila | مقيلة - Meilleur Fast Food à Casablanca",
    description: "Fast food complet à Maarif, Casablanca. Fruits de mer, sandwichs, tajines, salades. Livraison rapide.",
    type: "website",
    locale: "fr_FR",
    alternateLocale: "ar_MA",
    url: siteUrl,
    siteName: "M9ila",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "M9ila - Meilleur Fast Food à Casablanca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "M9ila | مقيلة - Meilleur Fast Food à Casablanca",
    description: "Fast food complet à Maarif, Casablanca. Fruits de mer, sandwichs, tajines, salades.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body
        className={`${tajawal.variable} ${montserrat.variable} font-montserrat antialiased text-dark bg-background`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
