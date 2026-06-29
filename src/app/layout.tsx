import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { CurrencyProvider } from "@/currency/CurrencyProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Contai — The Art Market",
  description: "Discover and reserve original art from Budapest artists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body>
        <LanguageProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}