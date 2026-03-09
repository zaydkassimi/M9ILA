import type { Metadata } from "next";
import { Tajawal, Montserrat } from "next/font/google";
import "./globals.css";

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
  title: "M9ila | مقيلة - Fast Food Fruits de Mer",
  description: "La Saveur Enflammée de la Mer. Fast food Casablanca, Maroc.",
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
        {children}
      </body>
    </html>
  );
}
