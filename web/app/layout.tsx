import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Home Inventory",
  description: "Manage your home inventory with QR codes & AI search",
};

/**
 * HeroUI v3 — NO Provider needed.
 * Tailwind CSS v4 — @import "tailwindcss" in globals.css.
 * Compound components: Card.Header, Card.Body, etc.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
