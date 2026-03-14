"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppointmentForCalendar } from "@/lib/calendar-events";

// ─── Grid config ─────────────────────────────────────────────────────────────
const HOUR_START = 7;
const HOUR_END = 21;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const HOUR_PX = 80; // pixels per hour

// ─── Time helpers ─────────────────────────────────────────────────────────────
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function eventTopPx(startTime: string): number {
  return Math.max(0, ((timeToMin(startTime) - HOUR_START * 60) / 60) * HOUR_PX);
}

function eventHeightPx(startTime: string, endTime: string): number {
  return Math.max(24, ((timeToMin(endTime) - timeToMin(startTime)) / 60) * HOUR_PX);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function getMondayOf(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const dow = c.getDay();
  c.setDate(c.getDate() + (dow === 0 ? -6 : 1 - dow));
  return c;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

function isToday(d: Date): boolean {
  return toLocalDateStr(d) === toLocalDateStr(new Date());
}

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const DAY_LONG  = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const MONTH_IT  = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function weekTitle(monday: Date): string {
  const sun = addDays(monday, 6);
  return monday.getMonth() === sun.getMonth()
    ? `${monday.getDate()}–${sun.getDate()} ${MONTH_IT[monday.getMonth()]} ${monday.getFullYear()}`
    : `${monday.getDate()} ${MONTH_IT[monday.getMonth()]} – ${sun.getDate()} ${MONTH_IT[sun.getMonth()]} ${monday.getFullYear()}`;
}

function dayTitle(d: Date): string {
  return `${DAY_LONG[d.getDay()]} ${d.getDate()} ${MONTH_IT[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Status styles ────────────────────────────────────────────────────────────
type EffStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

const STATUS_STYLE: Record<EffStatus, {
  border: string; bg: string; titleColor: string; subColor: string; dot: string;
}> = {
  PENDING:   { border: "#f59e0b", bg: "#fffbeb", titleColor: "#92400e", subColor: "#b45309", dot: "bg-amber-400"   },
  CONFIRMED: { border: "#10b981", bg: "#ecfdf5", titleColor: "#064e3b", subColor: "#047857", dot: "bg-emerald-500" },
  COMPLETED: { border: "#3b82f6", bg: "#eff6ff", titleColor: "#1e3a8a", subColor: "#1d4ed8", dot: "bg-sky-500"     },
  CANCELLED: { border: "#d1d5db", bg: "#f9fafb", titleColor: "#9ca3af", subColor: "#9ca3af", dot: "bg-gray-300"    },
  NO_SHOW:   { border: "#f97316", bg: "#fff7ed", titleColor: "#7c2d12", subColor: "#c2410c", dot: "bg-orange-500"  },
};

const LEGEND: { label: string; status: EffStatus }[] = [
  { label: "In attesa",  status: "PENDING"   },
  { label: "Confermato", status: "CONFIRMED" },
  { label: "Completato", status: "COMPLETED" },
  { label: "Annullato",  status: "CANCELLED" },
  { label: "No-show",    status: "NO_SHOW"   },
];

function effStatus(a: AppointmentForCalendar): EffStatus {
  if (a.noShow && a.status !== "CANCELLED") return "NO_SHOW";
  return (a.status as EffStatus) in STATUS_STYLE ? (a.status as EffStatus) : "PENDING";
}

// ─── Overlap layout ───────────────────────────────────────────────────────────
interface PlacedEvent {
  appt: AppointmentForCalendar;
  top: number;
  height: number;
  colIdx: number;
  colTotal: number;
}

function layoutDay(appts: AppointmentForCalendar[]): PlacedEvent[] {
  const sorted = [...appts].sort((a, b) => a.startTime.localeCompare(b.startTime));
  // Group overlapping appointments into clusters, then assign columns within each
  const clusters: AppointmentForCalendar[][] = [];
  for (const appt of sorted) {
    const s = timeToMin(appt.startTime), e = timeToMin(appt.endTime);
    const cluster = clusters.find((cl) =>
      cl.some((x) => s < timeToMin(x.endTime) && e > timeToMin(x.startTime))
    );
    if (cluster) cluster.push(appt);
    else clusters.push([appt]);
  }
  return clusters.flatMap((cl) =>
    cl.map((appt, colIdx) => ({
      appt,
      top: eventTopPx(appt.startTime),
      height: eventHeightPx(appt.startTime, appt.endTime),
      colIdx,
      colTotal: cl.length,
    }))
  );
}

// ─── Now indicator hook ───────────────────────────────────────────────────────
function useNowTop(): number | null {
  const [top, setTop] = useState<number | null>(null);
  useEffect(() => {
    function calc() {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes();
      if (h < HOUR_START || h >= HOUR_END) { setTop(null); return; }
      setTop(((h * 60 + m - HOUR_START * 60) / 60) * HOUR_PX);
    }
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, []);
  return top;
}

// ─── Event card ───────────────────────────────────────────────────────────────
function EventCard({ ev, onClick }: { ev: PlacedEvent; onClick: () => void }) {
  const { appt, top, height, colIdx, colTotal } = ev;
  const st = STATUS_STYLE[effStatus(appt)];
  const tiny  = height < 34;
  const short = height < 56;
  const w = colTotal === 1 ? "calc(100% - 4px)" : `calc(${100 / colTotal}% - 3px)`;
  const l = colTotal === 1 ? "1px"               : `calc(${(colIdx / colTotal) * 100}%)`;

  return (
    <button
      type="button"
      className="absolute rounded-r-[5px] text-left transition-all duration-100 hover:brightness-95 hover:shadow-md hover:z-10 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 overflow-hidden"
      style={{
        top,
        height: Math.max(height, 20),
        left: l,
        width: w,
        backgroundColor: st.bg,
        borderLeft: `3px solid ${st.border}`,
        paddingLeft: 6,
        paddingRight: 4,
        paddingTop: tiny ? 2 : 4,
        paddingBottom: tiny ? 2 : 4,
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {tiny ? (
        <span className="block truncate text-[10px] font-semibold leading-tight" style={{ color: st.titleColor }}>
          {appt.client.name}
        </span>
      ) : (
        <>
          <span className="block truncate text-[11px] font-semibold leading-tight" style={{ color: st.titleColor }}>
            {appt.client.name}
          </span>
          {!short && (
            <span className="block truncate text-[10px] leading-tight mt-[2px]" style={{ color: st.subColor }}>
              {appt.service.name}
            </span>
          )}
          <span className="block text-[9.5px] leading-tight mt-[2px] tabular-nums" style={{ color: st.subColor, opacity: 0.75 }}>
            {appt.startTime}–{appt.endTime}
          </span>
        </>
      )}
    </button>
  );
}

// ─── Day column ───────────────────────────────────────────────────────────────
function DayColumn({
  date, appts, nowTop, onEventClick, onSlotClick,
}: {
  date: Date;
  appts: AppointmentForCalendar[];
  nowTop: number | null;
  onEventClick: (id: string) => void;
  onSlotClick: (dateStr: string, time: string) => void;
}) {
  const placed = useMemo(() => layoutDay(appts), [appts]);
  const today  = isToday(date);
  const dateStr = toLocalDateStr(date);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relMin = ((e.clientY - rect.top) / HOUR_PX) * 60;
    const snapped = Math.round(relMin / 30) * 30;
    const totalMin = HOUR_START * 60 + snapped;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h >= HOUR_START && h < HOUR_END) {
      onSlotClick(dateStr, `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ height: TOTAL_HOURS * HOUR_PX }}
      onClick={handleClick}
    >
      {/* Today bg */}
      {today && <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />}

      {/* Hour lines */}
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={i} className="absolute inset-x-0 border-t border-border/50" style={{ top: i * HOUR_PX }} />
      ))}
      {/* 30-min dashed lines */}
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={`h${i}`} className="absolute inset-x-0 border-t border-dashed border-border/25" style={{ top: i * HOUR_PX + HOUR_PX / 2 }} />
      ))}

      {/* Now indicator */}
      {nowTop !== null && (
        <div className="absolute inset-x-0 z-20 flex items-center pointer-events-none" style={{ top: nowTop }}>
          <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" style={{ marginLeft: -4 }} />
          <div className="flex-1 h-px bg-red-500" />
        </div>
      )}

      {/* Events */}
      <div className="absolute inset-0 pointer-events-none">
        {placed.map((ev) => (
          <div key={ev.appt.id} className="pointer-events-auto">
            <EventCard ev={ev} onClick={() => onEventClick(ev.appt.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface AppointmentsCalendarProps {
  appointments: AppointmentForCalendar[];
  onEventClick: (appointmentId: string) => void;
  onSlotSelect: (date: string, startTime: string) => void;
}

type ViewMode = "week" | "day";

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);

export function AppointmentsCalendar({
  appointments,
  onEventClick,
  onSlotSelect,
}: AppointmentsCalendarProps) {
  const [view, setView]       = useState<ViewMode>("week");
  const [current, setCurrent] = useState(() => getMondayOf(new Date()));
  const nowTop = useNowTop();
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll to current time (or 8 AM) on mount
  useEffect(() => {
    if (!gridRef.current) return;
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const inRange = h >= HOUR_START && h < HOUR_END;
    const scrollTo = inRange
      ? Math.max(0, ((h * 60 + m - HOUR_START * 60 - 60) / 60) * HOUR_PX)
      : HOUR_PX; // default 8:00
    gridRef.current.scrollTop = scrollTo;
  }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(current, i)),
    [current]
  );
  const displayDays = view === "week" ? weekDays : [current];
  const title = view === "week" ? weekTitle(current) : dayTitle(current);

  function navigate(dir: -1 | 1) {
    setCurrent((d) => addDays(d, view === "week" ? 7 * dir : dir));
  }
  function goToday() {
    setCurrent(view === "week" ? getMondayOf(new Date()) : new Date());
  }
  function switchView(v: ViewMode) {
    setView(v);
    if (v === "week") setCurrent(getMondayOf(current));
  }
  function getAppts(date: Date): AppointmentForCalendar[] {
    const ds = toLocalDateStr(date);
    return appointments.filter((a) => {
      const raw = typeof a.appointmentDate === "string" ? a.appointmentDate : String(a.appointmentDate);
      return raw.slice(0, 10) === ds;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3 ml-1" onClick={goToday}>
            Oggi
          </Button>
        </div>

        <span className="text-sm font-semibold flex-1 text-center sm:text-left capitalize">
          {title}
        </span>

        <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5 ml-auto">
          {(["week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v === "week" ? "Settimana" : "Giorno"}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Legend ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-12 text-xs text-muted-foreground">
        {LEGEND.map((l) => (
          <span key={l.status} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", STATUS_STYLE[l.status].dot)} />
            {l.label}
          </span>
        ))}
        <span className="ml-auto hidden md:block">
          Clicca un evento per modificarlo · Clicca uno slot per aggiungere
        </span>
      </div>

      {/* ─── Calendar grid ───────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Day header row */}
        <div className="flex border-b bg-muted/20">
          <div className="w-12 shrink-0 border-r" />
          <div className={cn("flex flex-1", view === "week" && "overflow-x-auto")}>
            {displayDays.map((day) => {
              const today = isToday(day);
              return (
                <div
                  key={toLocalDateStr(day)}
                  className={cn(
                    "flex-1 border-r last:border-r-0 py-2 text-center",
                    view === "week" && "min-w-[65px]",
                    today && "bg-primary/5"
                  )}
                >
                  <p className={cn("text-[11px] font-medium uppercase tracking-wide", today ? "text-primary" : "text-muted-foreground")}>
                    {DAY_SHORT[day.getDay()]}
                  </p>
                  <div
                    className={cn(
                      "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                      today ? "bg-primary text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable time grid */}
        <div className="flex overflow-y-auto" style={{ maxHeight: 640 }} ref={gridRef}>
          {/* Hour labels */}
          <div className="w-12 shrink-0 border-r bg-muted/10 relative" style={{ height: TOTAL_HOURS * HOUR_PX }}>
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] tabular-nums text-muted-foreground/70"
                style={{ top: i * HOUR_PX - 7 }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className={cn("flex flex-1", view === "week" && "overflow-x-auto")}>
            {displayDays.map((day) => (
              <div
                key={toLocalDateStr(day)}
                className={cn(
                  "flex-1 border-r last:border-r-0",
                  view === "week" && "min-w-[65px]"
                )}
              >
                <DayColumn
                  date={day}
                  appts={getAppts(day)}
                  nowTop={isToday(day) ? nowTop : null}
                  onEventClick={onEventClick}
                  onSlotClick={onSlotSelect}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
