import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Appuntamenti" };
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppointmentsPageContent } from "@/components/appointments/appointments-page-content";
import type { AppointmentStatus } from "@/generated/prisma/client";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.businessId) redirect("/login");

  const { q, status, date } = await searchParams;
  const businessId = session.user.businessId;

  // Build appointment filter
  const dateFilter = date
    ? (() => {
        const d = new Date(date + "T00:00:00");
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        return { gte: d, lt: next };
      })()
    : undefined;

  const [appointments, clients, services] = await Promise.all([
    db.appointment.findMany({
      where: {
        businessId,
        ...(status ? { status: status as AppointmentStatus } : {}),
        ...(dateFilter ? { appointmentDate: dateFilter } : {}),
        ...(q
          ? {
              client: {
                OR: [
                  { name: { contains: q, mode: "insensitive" as const } },
                  { phone: { contains: q } },
                ],
              },
            }
          : {}),
      },
      include: {
        client: { select: { name: true, phone: true } },
        service: { select: { name: true } },
      },
      orderBy: [{ appointmentDate: "desc" }, { startTime: "asc" }],
      take: 100,
    }),
    db.client.findMany({
      where: { businessId },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
    db.service.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true, durationMinutes: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <Suspense>
      <AppointmentsPageContent
        appointments={JSON.parse(JSON.stringify(appointments))}
        clients={clients}
        services={services}
      />
    </Suspense>
  );
}
