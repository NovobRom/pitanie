import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

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
  title: "Dose — Calorie & Macro Tracker",
  description: "Track calories, protein, fat and carbs in seconds. Clean, fast, minimal.",
  keywords: ["calorie tracker", "macro tracker", "food diary", "nutrition", "dose"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dose",
  },
  openGraph: {
    title: "Dose — Calorie & Macro Tracker",
    description: "Track calories, protein, fat and carbs in seconds. Clean, fast, minimal.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
};

// Applies the saved theme before first paint to avoid a flash of the wrong theme.
const noFlashThemeScript = `
(function() {
  try {
    var t = localStorage.getItem('pitanie.theme');
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body
        className={`${inter.variable} ${nunito.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
