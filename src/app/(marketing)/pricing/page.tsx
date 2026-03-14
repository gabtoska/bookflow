import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prezzi — BookFlow",
  description: "Piani semplici e trasparenti per la tua attività.",
};

const plans = [
  {
    name: "Starter",
    price: "€0",
    period: "/mese",
    description: "Perfetto per iniziare e provare BookFlow.",
    features: [
      "50 appuntamenti al mese",
      "1 servizio",
      "Pagina di prenotazione pubblica",
      "Gestione clienti base",
      "Dashboard con statistiche",
    ],
    cta: "Inizia Gratis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "€19",
    period: "/mese",
    description: "Per attività che vogliono crescere e risparmiare tempo.",
    features: [
      "Appuntamenti illimitati",
      "Servizi illimitati",
      "Promemoria WhatsApp automatici",
      "Statistiche avanzate",
      "Ricerca e filtri avanzati",
      "Supporto prioritario via email",
      "Esportazione dati",
    ],
    cta: "Inizia la Prova Gratuita",
    highlight: true,
  },
  {
    name: "Premium",
    price: "€39",
    period: "/mese",
    description: "Per team, multi-operatore e multi-sede.",
    features: [
      "Tutto incluso in Pro",
      "Multi operatore",
      "Multi sede",
      "API personalizzate",
      "Integrazioni avanzate",
      "Assistenza dedicata",
      "Onboarding personalizzato",
    ],
    cta: "Contattaci",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Prezzi semplici, zero sorprese
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nessun costo nascosto. Upgradi o cancelli quando vuoi.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-primary bg-card shadow-lg ring-1 ring-primary/20"
                  : "bg-card shadow-sm"
              }`}
            >
              {plan.highlight && (
                <span className="mb-4 inline-block w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Più Popolare
                </span>
              )}
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                size="lg"
                variant={plan.highlight ? "default" : "outline"}
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Hai domande?{" "}
            <span className="font-medium text-foreground">Scrivici a info@bookflow.it</span>
          </p>
        </div>
      </div>
    </section>
  );
}
