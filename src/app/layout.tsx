import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { CurrencyProvider } from "@/currency/CurrencyProvider";
import { DEFAULT_LANG, Lang } from "@/i18n/dictionaries";
import { Currency } from "@/currency/CurrencyProvider";

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
  const jar = cookies();
  const langCookie = jar.get("contai_lang")?.value;
  const lang: Lang = (langCookie === "hu" || langCookie === "en" || langCookie === "ro")
    ? langCookie
    : DEFAULT_LANG;

  const curCookie = jar.get("contai_currency")?.value;
  const currency: Currency = (curCookie === "HUF" || curCookie === "EUR" || curCookie === "RON")
    ? curCookie
    : "HUF";

  return (
    <html lang={lang} className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body>
        <LanguageProvider initialLang={lang}>
          <CurrencyProvider initialCurrency={currency}>{children}</CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}