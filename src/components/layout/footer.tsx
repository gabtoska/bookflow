import Link from "next/link";
import { Calendar } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              BookFlow
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Gestione appuntamenti semplice per piccole attività.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Prodotto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground">Funzionalità</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Prezzi</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground">Come Funziona</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Azienda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">Chi Siamo</span></li>
              <li><span className="cursor-default">Contatti</span></li>
              <li><span className="cursor-default">Blog</span></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legale</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Termini di Servizio</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BookFlow. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}
