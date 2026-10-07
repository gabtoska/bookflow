import {
  BellRing,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Scissors,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const appointments = [
  { time: "09:00", name: "Marco Bianchi", service: "Taglio classico", tone: "coral" },
  { time: "10:30", name: "Elena Riva", service: "Colore + piega", tone: "lilac" },
  { time: "12:00", name: "Luca Greco", service: "Barba", tone: "mint" },
  { time: "15:00", name: "Giulia Conti", service: "Taglio + piega", tone: "yellow" },
];

const tones: Record<string, string> = {
  coral: "border-[#e7592b] bg-[#ffe0d5]",
  lilac: "border-[#7767b7] bg-[#e4dfff]",
  mint: "border-[#428365] bg-[#d8eadf]",
  yellow: "border-[#bf9213] bg-[#fae8a5]",
};

export function ProductPreview({ variant }: { variant: "hero" | "showcase" }) {
  const showcase = variant === "showcase";

  return (
    <div className={cn("relative", showcase && "mx-auto max-w-6xl")}>
      <div
        className={cn(
          "overflow-hidden border border-[#1f211d]/15 bg-[#fbfaf6] shadow-[0_30px_80px_rgba(31,33,29,0.18)]",
          showcase ? "rounded-[1.75rem]" : "rounded-[1.4rem] lg:-rotate-1"
        )}
      >
        <div className="flex h-11 items-center justify-between border-b border-[#1f211d]/10 bg-white px-4">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff7a4c]" />
            <span className="size-2.5 rounded-full bg-[#f4cf58]" />
            <span className="size-2.5 rounded-full bg-[#8fc4a8]" />
          </div>
          <div className="rounded-full bg-[#f0eee8] px-6 py-1 text-[9px] font-medium text-[#777a70]">
            app.bookflow.it/dashboard
          </div>
          <MoreHorizontal className="size-4 text-[#777a70]" />
        </div>

        <div className="flex min-h-[430px] sm:min-h-[500px]">
          <aside className="hidden w-44 shrink-0 border-r border-[#1f211d]/10 bg-[#f0ede5] p-4 sm:block lg:w-52">
            <div className="flex items-center gap-2 px-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#e7592b] text-white">
                <CalendarDays className="size-3.5" />
              </span>
              <span className="text-sm font-extrabold tracking-tight">BookFlow</span>
            </div>
            <div className="mt-7 rounded-xl bg-white/70 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b8d84]">
                La tua attività
              </p>
              <p className="mt-1 truncate text-xs font-bold">Studio Arancio</p>
            </div>
            <nav className="mt-5 space-y-1 text-[11px]">
              {[
                [LayoutDashboard, "Panoramica", false],
                [CalendarDays, "Appuntamenti", true],
                [Users, "Clienti", false],
                [Scissors, "Servizi", false],
                [Settings, "Impostazioni", false],
              ].map(([Icon, label, active]) => {
                const NavIcon = Icon as typeof LayoutDashboard;
                return (
                  <div
                    key={label as string}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2",
                      active ? "bg-[#1f211d] font-semibold text-white" : "text-[#686b62]"
                    )}
                  >
                    <NavIcon className="size-3.5" />
                    {label as string}
                  </div>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 bg-[#fbfaf6]">
            <header className="flex h-14 items-center justify-between border-b border-[#1f211d]/10 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold sm:text-sm">Appuntamenti</p>
                <span className="rounded-full bg-[#f4cf58] px-2 py-0.5 text-[8px] font-bold">OGGI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg border border-[#1f211d]/10 bg-white px-2.5 py-1.5 text-[9px] text-[#8b8d84] md:flex">
                  <Search className="size-3" />
                  Cerca cliente
                </div>
                <span className="flex items-center gap-1.5 rounded-lg bg-[#e7592b] px-2.5 py-1.5 text-[9px] font-bold text-white">
                  <Plus className="size-3" />
                  Nuovo
                </span>
              </div>
            </header>

            <div className="p-3 sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-serif text-xl font-bold tracking-tight sm:text-2xl">
                    Mercoledì, 7 ottobre
                  </p>
                  <p className="mt-1 text-[9px] text-[#777a70] sm:text-[10px]">
                    4 appuntamenti · ultimo alle 15:45
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-[#1f211d]/10 bg-white p-1 text-[9px]">
                  <span className="rounded-md bg-[#1f211d] px-2 py-1 text-white">Giorno</span>
                  <span className="px-2 py-1 text-[#777a70]">Settimana</span>
                  <ChevronDown className="mr-1 size-3" />
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-[#1f211d]/10 bg-white">
                <div className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[4.5rem_1fr]">
                  <div className="border-r border-[#1f211d]/10 bg-[#faf9f5] py-2">
                    {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(
                      (time) => (
                        <div key={time} className="h-10 pr-2 text-right text-[8px] text-[#96988f] sm:h-12">
                          {time}
                        </div>
                      )
                    )}
                  </div>
                  <div className="relative py-2">
                    {Array.from({ length: 9 }, (_, index) => (
                      <div key={index} className="h-10 border-b border-dashed border-[#1f211d]/8 sm:h-12" />
                    ))}

                    {appointments.map((appointment, index) => (
                      <div
                        key={appointment.time}
                        className={cn(
                          "absolute left-2 right-2 rounded-r-lg border-l-[3px] px-2.5 py-1.5 shadow-sm sm:left-3 sm:right-3",
                          tones[appointment.tone]
                        )}
                        style={{ top: `${25 + index * 91}px` }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[9px] font-bold sm:text-[11px]">
                              {appointment.name}
                            </p>
                            <p className="truncate text-[8px] text-[#62655c] sm:text-[9px]">
                              {appointment.service}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-[8px] font-semibold sm:text-[9px]">
                            <Clock3 className="size-2.5" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute rounded-[1.5rem] border-[5px] border-[#1f211d] bg-[#fbfaf6] text-[#1f211d] shadow-[0_24px_60px_rgba(31,33,29,0.24)]",
          showcase
            ? "-bottom-8 right-5 hidden w-52 md:block lg:right-10"
            : "-bottom-8 -right-2 w-44 sm:-right-4 sm:w-52"
        )}
      >
        <div className="mx-auto h-3 w-16 rounded-b-xl bg-[#1f211d]" />
        <div className="p-4 sm:p-5">
          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#e7592b]">
            Richiesta inviata
          </p>
          <div className="mt-4 flex size-9 items-center justify-center rounded-full bg-[#bfd9cb]">
            <Check className="size-4" strokeWidth={3} />
          </div>
          <p className="mt-3 font-serif text-lg font-bold leading-tight">A martedì, Giulia.</p>
          <p className="mt-1.5 text-[9px] leading-4 text-[#777a70]">
            La richiesta è arrivata a Studio Arancio.
          </p>
          <div className="mt-4 rounded-xl bg-[#f0ede5] p-3">
            <p className="text-[8px] text-[#777a70]">Taglio + piega</p>
            <p className="mt-1 text-[10px] font-bold">Martedì · 14:30</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[8px] font-semibold text-[#56705f]">
            <BellRing className="size-3" />
            Richiesta registrata
          </div>
        </div>
      </div>
    </div>
  );
}
