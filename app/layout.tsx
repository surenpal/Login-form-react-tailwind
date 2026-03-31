import type { Metadata } from "next";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "N1 Vocabulary App",
  description:
    "A mobile-first JLPT N1 vocabulary study app with premium access and PayPay-ready checkout for learners in Japan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSansJp.variable} ${outfit.variable}`}>
      <body className="font-[var(--font-body)] antialiased">{children}</body>
    </html>
  );
}
