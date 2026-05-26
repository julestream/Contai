import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}