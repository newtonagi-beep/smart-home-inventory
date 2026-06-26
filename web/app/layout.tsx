import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "./nav";

export const metadata: Metadata = {
  title: "Smart Home Inventory",
  description: "Manage your home inventory with QR codes & AI search",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
