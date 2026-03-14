import type { Metadata } from "next";
import Link from "next/link";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Accedi — BookFlow",
  description: "Accedi o registrati per gestire i tuoi appuntamenti con BookFlow.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-muted/40 to-background px-4 py-12">
      <Link
        href="/"
        className="mb-2 flex items-center gap-2 text-xl font-bold"
      >
        <Calendar className="h-6 w-6 text-primary" />
        BookFlow
      </Link>
      <p className="mb-8 text-sm text-muted-foreground">Gestione appuntamenti semplice</p>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
