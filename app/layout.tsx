import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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
    <html lang="en">
      <body className="font-[var(--font-body)] antialiased">{children}</body>
    </html>
  );
}
