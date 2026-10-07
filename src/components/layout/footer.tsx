import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1f211d] text-[#f7f4ed]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-extrabold">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#e7592b]">
                <CalendarDays className="size-4" />
              </span>
              BookFlow
            </Link>
            <p className="mt-5 max-w-sm font-serif text-2xl leading-tight text-[#d5d2c9]">
              Un’agenda più calma per giornate che non lo sono sempre.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f9288]">Esplora</p>
            <nav className="mt-5 flex flex-col gap-3 text-sm">
              <Link href="/#prodotto" className="hover:text-[#f4cf58]">Il prodotto</Link>
              <Link href="/#come-funziona" className="hover:text-[#f4cf58]">Come funziona</Link>
              <Link href="/pricing" className="hover:text-[#f4cf58]">Prezzi</Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f9288]">Parliamone</p>
            <a href="mailto:info@bookflow.it" className="mt-5 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-sm hover:text-[#f4cf58]">
              info@bookflow.it
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-[#8f9288] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} BookFlow.</p>
          <p>Prenotazioni semplici, tempo ben speso.</p>
        </div>
      </div>
    </footer>
  );
}
