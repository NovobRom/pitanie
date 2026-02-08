import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "План Питания — Роман и Лиза",
  description: "Персональный план питания на неделю с расчётом калорий и КБЖУ",
  authors: [{ name: "Roman" }],
  keywords: ["питание", "калории", "КБЖУ", "меню"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Питание",
  },
  openGraph: {
    title: "План Питания",
    description: "Персональный план питания на неделю",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c9885",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
