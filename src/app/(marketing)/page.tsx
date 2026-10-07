import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Check,
  Clock3,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/components/marketing/product-preview";

export const metadata: Metadata = {
  title: "BookFlow — L’agenda che si prende cura del tuo tempo",
  description:
    "Prenotazioni online, agenda quotidiana e promemoria in un solo spazio, pensato per le piccole attività che lavorano su appuntamento.",
};

const workflow = [
  {
    number: "01",
    title: "Metti online i tuoi servizi",
    text: "Scegli durata, prezzo e disponibilità. Il tuo link di prenotazione è subito pronto da condividere.",
  },
  {
    number: "02",
    title: "Lascia scegliere il momento giusto",
    text: "I clienti vedono solo gli orari davvero liberi e prenotano senza telefonate o messaggi incrociati.",
  },
  {
    number: "03",
    title: "Tieni la giornata sotto controllo",
    text: "Conferme, note e promemoria restano collegati all’appuntamento, in un’agenda facile da leggere.",
  },
];

const audiences = ["Barberie", "Saloni", "Studi", "Freelance", "Centri benessere"];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-[#f7f4ed] text-[#1f211d]">
      <section className="relative border-b border-[#1f211d]/10">
        <div className="pointer-events-none absolute -left-28 top-28 h-80 w-80 rounded-full bg-[#ff7a4c]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-[34rem] w-[34rem] rounded-full bg-[#bfd9cb]/35 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
              <span className="h-px w-8 bg-[#e7592b]" aria-hidden="true" />
              Fatto per chi vive di appuntamenti
            </div>

            <h1 className="font-serif text-[clamp(3.25rem,7vw,6.8rem)] leading-[0.88] tracking-[-0.055em]">
              Più tempo
              <span className="block italic text-[#e7592b]">per il tuo lavoro.</span>
              <span className="block">Meno per l’agenda.</span>
            </h1>

            <p className="mt-8 max-w-lg text-base leading-7 text-[#55584f] sm:text-lg">
              BookFlow raccoglie prenotazioni, clienti e giornata di lavoro in un unico posto.
              Semplice da aprire al mattino. Ancora più semplice da condividere.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-full bg-[#1f211d] px-6 text-white shadow-[0_10px_30px_rgba(31,33,29,0.18)] hover:bg-[#34372f]"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Crea la tua agenda
                <ArrowUpRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-[#1f211d]/20 bg-white/55 px-6 hover:bg-white"
                nativeButton={false}
                render={<Link href="#prodotto" />}
              >
                Guarda come funziona
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#686b62]">
              {["Configurazione rapida", "Nessuna carta richiesta", "Pagina pubblica inclusa"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span className="flex size-4 items-center justify-center rounded-full bg-[#bfd9cb]">
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="relative lg:pl-4">
            <div className="absolute -right-8 -top-8 z-10 hidden rotate-6 rounded-full bg-[#f4cf58] px-5 py-3 text-sm font-bold shadow-sm lg:block">
              La giornata, a colpo d’occhio
            </div>
            <ProductPreview variant="hero" />
          </div>
        </div>
      </section>

      <div className="border-b border-[#1f211d]/10 bg-[#f4cf58]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 text-xs font-bold uppercase tracking-[0.17em] sm:px-6 lg:justify-between lg:px-8">
          <span>Prenotazioni online</span>
          <span className="hidden size-1 rounded-full bg-[#1f211d] sm:block" />
          <span>Agenda visiva</span>
          <span className="hidden size-1 rounded-full bg-[#1f211d] sm:block" />
          <span>Clienti in ordine</span>
          <span className="hidden size-1 rounded-full bg-[#1f211d] sm:block" />
          <span>Stati e note</span>
        </div>
      </div>

      <section id="prodotto" className="bg-[#1f211d] py-20 text-[#f7f4ed] sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4cf58]">
                Dentro BookFlow
              </p>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">
                Un’agenda che si legge come la tua giornata.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#bec1b8] lg:pb-1">
              Niente pannelli pieni di numeri da decifrare. Vedi chi arriva, quale servizio ha
              scelto e cosa richiede attenzione—senza perdere il filo.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <ProductPreview variant="showcase" />
          </div>
        </div>
      </section>

      <section id="come-funziona" className="border-b border-[#1f211d]/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e7592b]">
                Dal link alla poltrona
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
                Il percorso breve verso un’agenda piena.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-[#62655c]">
                Tu imposti le regole una volta. Da lì, BookFlow accompagna ogni prenotazione
                fino alla tua agenda.
              </p>
            </div>

            <div className="border-t border-[#1f211d]/15">
              {workflow.map((item) => (
                <article
                  key={item.number}
                  className="grid gap-4 border-b border-[#1f211d]/15 py-8 sm:grid-cols-[5rem_1fr] sm:py-10"
                >
                  <span className="font-mono text-sm text-[#e7592b]">{item.number}</span>
                  <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
                    <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{item.title}</h3>
                    <p className="leading-7 text-[#62655c]">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-[#ded7ff] p-6 sm:p-10 lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#1f211d] text-white">
                  <BellRing className="size-5" />
                </div>
                <h2 className="mt-8 max-w-xl font-serif text-4xl leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                  Ogni dettaglio al suo posto.
                </h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-[#55516c] sm:text-lg">
                  Dalla nota del cliente allo stato della prenotazione: le informazioni utili
                  restano vicine al momento in cui ti servono.
                </p>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex items-center gap-2 border-b border-[#1f211d] pb-1 text-sm font-bold"
                >
                  Prova il flusso completo
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="rotate-2 rounded-[1.75rem] border border-[#1f211d]/15 bg-[#f7f4ed] p-5 shadow-[0_24px_60px_rgba(31,33,29,0.16)] sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#77736c]">
                        Prossimo appuntamento
                      </p>
                      <p className="mt-2 text-2xl font-bold">Giulia Conti</p>
                    </div>
                    <span className="rounded-full bg-[#bfd9cb] px-3 py-1 text-xs font-bold">
                      Confermato
                    </span>
                  </div>
                  <div className="my-6 h-px bg-[#1f211d]/10" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#77736c]">Servizio</p>
                      <p className="mt-1 font-semibold">Taglio + piega</p>
                    </div>
                    <div>
                      <p className="text-[#77736c]">Quando</p>
                      <p className="mt-1 font-semibold">Oggi, 14:30</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#f4cf58]">
                      <BellRing className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Promemoria pronto</p>
                      <p className="text-xs text-[#77736c]">Controlla e invia dall’appuntamento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1f211d]/10 bg-white/55 py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#777a70]">
            Pensato per chi lavora su appuntamento
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {audiences.map((audience, index) => (
              <span
                key={audience}
                className={`rounded-full border border-[#1f211d]/15 px-5 py-2.5 font-serif text-xl italic sm:text-2xl ${
                  index === 1 ? "bg-[#ff7a4c] text-white" : "bg-[#f7f4ed]"
                }`}
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#e7592b] py-20 text-white sm:py-28">
        <Scissors className="absolute -right-12 -top-16 size-72 rotate-12 text-white/10" strokeWidth={1} />
        <CalendarDays className="absolute -bottom-20 -left-16 size-72 -rotate-12 text-white/10" strokeWidth={1} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-[#e7592b]">
            <Clock3 className="size-5" />
          </div>
          <h2 className="mt-7 font-serif text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl">
            Domani mattina, apri un’agenda migliore.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Configura attività, servizi e orari. Il tuo primo link di prenotazione è a pochi
            passaggi di distanza.
          </p>
          <Link
            href="/signup"
            className="mt-9 inline-flex h-12 items-center justify-center rounded-full border border-white bg-white px-7 text-sm font-semibold text-[#1f211d] transition-colors hover:border-[#1f211d] hover:bg-[#1f211d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e7592b]"
          >
            Inizia con BookFlow
            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
