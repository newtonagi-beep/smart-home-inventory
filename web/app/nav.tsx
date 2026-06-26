"use client";

import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/items", label: "Items" },
  { href: "/containers", label: "Containers" },
  { href: "/locations", label: "Locations" },
  { href: "/add", label: "+ Add", variant: "primary" as const },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/" className="text-lg font-bold tracking-tight">
          🏠 SHI
        </a>
        <div className="flex gap-2">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                variant={link.variant || (isActive ? "secondary" : "ghost")}
                size="sm"
                onPress={() => (window.location.href = link.href)}
              >
                {link.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
