"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/#prodotto", label: "Il prodotto" },
  { href: "/#come-funziona", label: "Come funziona" },
  { href: "/pricing", label: "Prezzi" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1f211d]/10 bg-[#f7f4ed]/90 text-[#1f211d] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-[-0.03em]">
          <span className="flex size-8 items-center justify-center rounded-[0.65rem] bg-[#e7592b] text-white shadow-sm">
            <CalendarDays className="size-4" />
          </span>
          <span className="text-lg">BookFlow</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigazione principale">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-[#696c63] transition-colors hover:text-[#e7592b]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" className="rounded-full" nativeButton={false} render={<Link href="/login" />}>
            Accedi
          </Button>
          <Button className="rounded-full bg-[#1f211d] px-5 text-white hover:bg-[#34372f]" nativeButton={false} render={<Link href="/signup" />}>
            Inizia gratis
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden" aria-label="Apri il menu">
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-l-[#1f211d]/10 bg-[#f7f4ed] p-6">
            <SheetTitle className="flex items-center gap-2.5 text-lg font-extrabold">
              <span className="flex size-8 items-center justify-center rounded-[0.65rem] bg-[#e7592b] text-white">
                <CalendarDays className="size-4" />
              </span>
              BookFlow
            </SheetTitle>
            <nav className="mt-10 flex flex-col" aria-label="Navigazione mobile">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-[#1f211d]/10 py-4 font-serif text-2xl">
                  {link.label}
                </Link>
              ))}
              <div className="mt-8 grid gap-2">
                <Button variant="outline" className="h-11 rounded-full border-[#1f211d]/20 bg-transparent" nativeButton={false} render={<Link href="/login" onClick={() => setOpen(false)} />}>
                  Accedi
                </Button>
                <Button className="h-11 rounded-full bg-[#1f211d] text-white" nativeButton={false} render={<Link href="/signup" onClick={() => setOpen(false)} />}>
                  Inizia gratis
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
