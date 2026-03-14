"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { generateAvailableSlots } from "@/lib/slots";
import { submitPublicBooking } from "@/actions/public-booking";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceData {
  id: string;
  name: string;
  durationMinutes: number;
  price: string | null;
}

interface WorkingHoursData {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

interface BookingFlowProps {
  business: {
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    slotIntervalMinutes: number;
  };
  services: ServiceData[];
  workingHours: WorkingHoursData[];
  existingAppointments: Record<string, { startTime: string; endTime: string }[]>;
}

interface BookingConfirmation {
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatPrice(price: string | null): string | null {
  if (!price) return null;
  const n = parseFloat(price);
  if (isNaN(n)) return null;
  return `€${n.toFixed(2)}`;
}

function getNextDays(count: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getNowTimeStr(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BookingFlow({ business, services, workingHours, existingAppointments }: BookingFlowProps) {
  // Flow state
  const [step, setStep] = useState(1); // 1=service, 2=date, 3=time, 4=details
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  // Selection state
  const [selectedServiceId, setSelectedServiceId] = useState(services.length === 1 ? services[0].id : "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  function handleBookAgain() {
    setConfirmation(null);
    setStep(1);
    setSelectedServiceId(services.length === 1 ? services[0].id : "");
    setSelectedDate("");
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setError("");
    setFieldErrors({});
  }

  // Customer form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Generate next 14 days for date selection
  const availableDates = useMemo(() => getNextDays(14), []);

  // Generate available time slots for selected date + service
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    const nowStr = selectedDate === getTodayStr() ? getNowTimeStr() : undefined;
    const dayAppointments = existingAppointments[selectedDate] || [];
    return generateAvailableSlots(
      workingHours,
      business.slotIntervalMinutes,
      selectedService.durationMinutes,
      dayAppointments,
      selectedDate,
      nowStr
    );
  }, [selectedDate, selectedService, workingHours, business.slotIntervalMinutes, existingAppointments]);

  // Reset downstream selections when upstream changes
  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate, selectedServiceId]);

  // Check if a date has working hours (for visual disabled state)
  const isDateOpen = (dateStr: string): boolean => {
    const d = new Date(dateStr + "T12:00:00");
    const dayOfWeek = d.getDay();
    const wh = workingHours.find((w) => w.dayOfWeek === dayOfWeek);
    return !!wh?.isOpen;
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleServiceSelect(serviceId: string) {
    setSelectedServiceId(serviceId);
    setSelectedDate("");
    setSelectedTime("");
    setError("");
    setStep(2);
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setError("");
    setStep(3);
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setError("");
    setStep(4);
  }

  function handleBack() {
    setError("");
    setFieldErrors({});
    if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setError("");
    setFieldErrors({});

    const formData = new FormData();
    formData.set("businessSlug", business.slug);
    formData.set("serviceId", selectedServiceId);
    formData.set("date", selectedDate);
    formData.set("startTime", selectedTime);
    formData.set("customerName", customerName);
    formData.set("customerPhone", customerPhone);
    formData.set("customerEmail", customerEmail);
    formData.set("notes", notes);

    startTransition(async () => {
      const result = await submitPublicBooking(formData);
      if (result.success) {
        setConfirmation(result.booking);
      } else {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  }

  // ─── Confirmation View ────────────────────────────────────────────────────

  if (confirmation) {
    return (
      <Card className="mx-auto max-w-lg border-emerald-200 bg-emerald-50/50">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900 mb-1">Prenotazione Inviata!</h2>
            <p className="text-sm text-emerald-700 mb-6">
              La tua richiesta è stata inviata a {confirmation.businessName}. Riceverai una conferma a breve.
            </p>

            <div className="w-full rounded-xl bg-white p-5 text-left space-y-3 border border-emerald-100">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{confirmation.customerName}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{confirmation.serviceName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{formatDate(confirmation.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">
                  {confirmation.startTime} — {confirmation.endTime}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleBookAgain}
              >
                Prenota un altro appuntamento
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                Chiudi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Step Indicator ───────────────────────────────────────────────────────

  const steps = [
    { num: 1, label: "Servizio" },
    { num: 2, label: "Data" },
    { num: 3, label: "Orario" },
    { num: 4, label: "Dati" },
  ];

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              disabled={s.num > step}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                s.num === step
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : s.num < step
                    ? "bg-primary/80 text-primary-foreground cursor-pointer"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s.num < step ? "✓" : s.num}
            </button>
            <span className={`hidden text-xs sm:inline ${s.num === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 sm:w-10 ${s.num < step ? "bg-primary/50" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ─── Step 1: Service Selection ─────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scegli un servizio</CardTitle>
            <CardDescription>Seleziona il servizio che desideri prenotare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceSelect(service.id)}
                className={`group w-full rounded-xl border p-4 text-left transition-all ${
                  selectedServiceId === service.id
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {service.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {formatPrice(service.price) && (
                      <Badge variant="secondary" className="text-sm font-semibold">
                        {formatPrice(service.price)}
                      </Badge>
                    )}
                    <ChevronRight className={`h-4 w-4 transition-colors ${
                      selectedServiceId === service.id
                        ? "text-primary"
                        : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    }`} />
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ─── Step 2: Date Selection ────────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-lg">Scegli la data</CardTitle>
                <CardDescription>Seleziona il giorno per il tuo appuntamento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Selected service summary */}
            {selectedService && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedService.name}</span>
                <span className="text-muted-foreground">· {selectedService.durationMinutes} min</span>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableDates.map((dateStr) => {
                const d = new Date(dateStr + "T12:00:00");
                const dayName = DAY_NAMES[d.getDay()];
                const dayNum = d.getDate();
                const monthName = MONTH_NAMES[d.getMonth()].slice(0, 3);
                const open = isDateOpen(dateStr);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!open}
                    onClick={() => handleDateSelect(dateStr)}
                    className={`relative flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
                      selectedDate === dateStr
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                        : open
                          ? "hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
                          : "opacity-35 cursor-not-allowed bg-muted/20"
                    }`}
                  >
                    {dateStr === getTodayStr() && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-1.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground leading-4">
                        oggi
                      </span>
                    )}
                    <span className={`text-xs font-medium ${
                      dateStr === getTodayStr() ? "text-primary" : "text-muted-foreground"
                    }`}>{dayName}</span>
                    <span className={`text-lg font-bold ${
                      dateStr === getTodayStr() && selectedDate !== dateStr ? "text-primary" : ""
                    }`}>{dayNum}</span>
                    <span className="text-xs text-muted-foreground">{monthName}</span>
                    {!open && <span className="text-[10px] text-destructive mt-0.5">Chiuso</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Step 3: Time Slot Selection ───────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-lg">Scegli l&apos;orario</CardTitle>
                <CardDescription>
                  {selectedService?.name} · {selectedDate && formatDate(selectedDate)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {availableSlots.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Nessun orario disponibile</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Prova a selezionare un&apos;altra data
                </p>
                <Button variant="outline" onClick={handleBack} className="mt-4">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Cambia data
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-all ${
                      selectedTime === time
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Step 4: Customer Details ──────────────────────────────────── */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-lg">I tuoi dati</CardTitle>
                <CardDescription>Inserisci i tuoi dati per completare la prenotazione</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Booking summary */}
            <div className="mb-6 rounded-xl border bg-muted/40 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servizio</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orario</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              {selectedService && formatPrice(selectedService.price) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prezzo</span>
                  <span className="font-medium">{formatPrice(selectedService.price)}</span>
                </div>
              )}
            </div>

            {/* Customer form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome e Cognome *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Mario Rossi"
                  aria-invalid={!!fieldErrors.customerName}
                />
                {fieldErrors.customerName && (
                  <p className="text-xs text-destructive">{fieldErrors.customerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefono *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+39 333 1234567"
                  aria-invalid={!!fieldErrors.customerPhone}
                />
                {fieldErrors.customerPhone && (
                  <p className="text-xs text-destructive">{fieldErrors.customerPhone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email (opzionale)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="mario@email.com"
                  aria-invalid={!!fieldErrors.customerEmail}
                />
                {fieldErrors.customerEmail && (
                  <p className="text-xs text-destructive">{fieldErrors.customerEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note (opzionale)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informazioni aggiuntive..."
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isPending || !customerName.trim() || !customerPhone.trim()}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Conferma Prenotazione
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
