import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "BookFlow — Gestione Appuntamenti Semplice",
  description:
    "Riduci gli appuntamenti mancati con BookFlow. Prenotazioni online, promemoria WhatsApp e gestione clienti in un'unica piattaforma.",
};
import {
  Calendar,
  Bell,
  Users,
  Clock,
  Globe,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(0,0,0,0.04),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-medium text-muted-foreground">
                <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Gestione appuntamenti per piccole attività
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl sm:leading-tight lg:text-6xl">
              Riduci gli appuntamenti mancati.{" "}
              <span className="text-muted-foreground">Gestisci tutto in un posto.</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:mt-6 sm:text-lg lg:text-xl">
              BookFlow aiuta barbieri, saloni, dentisti e piccole attività a gestire le
              prenotazioni, inviare promemoria e ridurre i no-show — senza complicazioni.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:gap-4 sm:mt-10 sm:flex-row sm:justify-center">
              <Button size="sm" className="w-full sm:w-auto sm:size-lg" nativeButton={false} render={<Link href="/signup" />}>
                Inizia Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto sm:size-lg" nativeButton={false} render={<Link href="#features" />}>
                Scopri di più
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/20 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Tutto ciò che serve per gestire gli appuntamenti
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
              Semplice, veloce, progettato per chi lavora davvero.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Gestione Appuntamenti",
                description:
                  "Crea, modifica e organizza i tuoi appuntamenti con un calendario intuitivo.",
              },
              {
                icon: Bell,
                title: "Promemoria Automatici",
                description:
                  "Invia promemoria WhatsApp ai clienti e riduci i no-show fino al 70%.",
              },
              {
                icon: Users,
                title: "Gestione Clienti",
                description:
                  "Tieni traccia dei tuoi clienti, delle loro preferenze e della cronologia.",
              },
              {
                icon: Globe,
                title: "Prenotazione Online",
                description:
                  "Pagina pubblica dove i clienti possono prenotare direttamente 24/7.",
              },
              {
                icon: Clock,
                title: "Orari di Lavoro",
                description:
                  "Configura facilmente i tuoi orari e la durata degli appuntamenti.",
              },
              {
                icon: BarChart3,
                title: "Statistiche",
                description:
                  "Monitora appuntamenti, no-show e andamento della tua attività.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Come funziona
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
              Inizia in meno di 2 minuti. Nessuna carta di credito richiesta.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:gap-8 sm:grid-cols-3 lg:mt-16">
            {[
              {
                step: "01",
                title: "Crea il tuo account",
                description: "Registrati e configura la tua attività con nome, servizi e orari.",
              },
              {
                step: "02",
                title: "Gestisci i tuoi appuntamenti",
                description:
                  "Aggiungi appuntamenti, gestisci clienti e condividi la pagina di prenotazione.",
              },
              {
                step: "03",
                title: "Riduci i no-show",
                description:
                  "I promemoria automatici ricordano ai clienti i loro appuntamenti.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-t bg-muted/20 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Prezzi semplici e trasparenti
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
              Scegli il piano giusto per la tua attività.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "€0",
                period: "/mese",
                description: "Per iniziare",
                features: [
                  "50 appuntamenti/mese",
                  "1 servizio",
                  "Pagina prenotazione",
                  "Gestione clienti base",
                ],
                cta: "Inizia Gratis",
                highlight: false,
              },
              {
                name: "Pro",
                price: "€19",
                period: "/mese",
                description: "Per attività in crescita",
                features: [
                  "Appuntamenti illimitati",
                  "Servizi illimitati",
                  "Promemoria WhatsApp",
                  "Statistiche avanzate",
                  "Supporto prioritario",
                ],
                cta: "Inizia la Prova",
                highlight: true,
              },
              {
                name: "Premium",
                price: "€39",
                period: "/mese",
                description: "Per team e multi-sede",
                features: [
                  "Tutto di Pro",
                  "Multi operatore",
                  "Multi sede",
                  "API personalizzate",
                  "Assistenza dedicata",
                ],
                cta: "Contattaci",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 sm:p-8 ${
                  plan.highlight
                    ? "border-primary bg-card shadow-lg ring-1 ring-primary/20"
                    : "bg-card shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Più Popolare
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-2 sm:space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs sm:text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className="mt-6 sm:mt-8 w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  nativeButton={false}
                  render={<Link href="/signup" />}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Pronto a ridurre i no-show?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg">
            Unisciti a centinaia di attività che già usano BookFlow per gestire i propri
            appuntamenti.
          </p>
          <Button size="sm" className="mt-6 sm:mt-8 sm:size-lg" nativeButton={false} render={<Link href="/signup" />}>
            Inizia Gratis Ora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
