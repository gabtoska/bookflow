import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking/booking-flow";
import { MapPin, Phone, Clock } from "lucide-react";
import type { Metadata } from "next";

interface BookPageProps {
  params: Promise<{ businessSlug: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    select: { name: true },
  });

  if (!business) return { title: "Attività non trovata" };

  return {
    title: `Prenota — ${business.name}`,
    description: `Prenota un appuntamento online con ${business.name}`,
  };
}

export default async function PublicBookingPage({ params }: BookPageProps) {
  const { businessSlug } = await params;

  // Fetch business with working hours and active services
  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    include: {
      workingHours: { orderBy: { dayOfWeek: "asc" } },
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!business) notFound();

  // Fetch existing appointments for the next 14 days (non-cancelled)
  const today = new Date();
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

  const upcomingAppointments = await db.appointment.findMany({
    where: {
      businessId: business.id,
      appointmentDate: {
        gte: new Date(today.toISOString().slice(0, 10) + "T00:00:00"),
        lt: new Date(twoWeeksLater.toISOString().slice(0, 10) + "T00:00:00"),
      },
      status: { notIn: ["CANCELLED"] },
    },
    select: {
      appointmentDate: true,
      startTime: true,
      endTime: true,
    },
  });

  // Group appointments by date string for efficient slot generation on client
  const appointmentsByDate: Record<string, { startTime: string; endTime: string }[]> = {};
  for (const apt of upcomingAppointments) {
    const dateStr =
      apt.appointmentDate instanceof Date
        ? apt.appointmentDate.toISOString().slice(0, 10)
        : new Date(apt.appointmentDate).toISOString().slice(0, 10);
    if (!appointmentsByDate[dateStr]) appointmentsByDate[dateStr] = [];
    appointmentsByDate[dateStr].push({
      startTime: apt.startTime,
      endTime: apt.endTime,
    });
  }

  // Serialize services (handle Decimal price)
  const serializedServices = business.services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: s.price ? s.price.toString() : null,
  }));

  const serializedWorkingHours = business.workingHours.map((wh) => ({
    dayOfWeek: wh.dayOfWeek,
    isOpen: wh.isOpen,
    startTime: wh.startTime,
    endTime: wh.endTime,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
              {business.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{business.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-0.5">
                {business.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {business.address}
                  </span>
                )}
                {business.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {business.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Trust text */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            Prenota in meno di un minuto
          </span>
        </div>

        {serializedServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center">
            <p className="font-medium">Nessun servizio disponibile</p>
            <p className="text-sm text-muted-foreground mt-1">
              Questa attività non ha ancora configurato i servizi per la prenotazione online.
            </p>
          </div>
        ) : (
          <BookingFlow
            business={{
              name: business.name,
              slug: business.slug,
              phone: business.phone,
              address: business.address,
              slotIntervalMinutes: business.slotIntervalMinutes,
            }}
            services={serializedServices}
            workingHours={serializedWorkingHours}
            existingAppointments={appointmentsByDate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-6 text-center text-xs text-muted-foreground">
        Powered by <span className="font-semibold">BookFlow</span>
      </footer>
    </div>
  );
}
