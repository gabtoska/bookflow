import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Plus,
  Clock,
  ArrowRight,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.businessId) redirect("/login");

  const businessId = session.user.businessId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    appointmentsToday,
    confirmedToday,
    cancelledToday,
    noShowCount,
    totalClients,
    upcomingAppointments,
    recentClients,
  ] = await Promise.all([
    db.appointment.count({
      where: {
        businessId,
        appointmentDate: { gte: today, lt: tomorrow },
      },
    }),
    db.appointment.count({
      where: {
        businessId,
        appointmentDate: { gte: today, lt: tomorrow },
        status: "CONFIRMED",
      },
    }),
    db.appointment.count({
      where: {
        businessId,
        appointmentDate: { gte: today, lt: tomorrow },
        status: "CANCELLED",
      },
    }),
    db.appointment.count({
      where: {
        businessId,
        noShow: true,
      },
    }),
    db.client.count({
      where: { businessId },
    }),
    db.appointment.findMany({
      where: {
        businessId,
        appointmentDate: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        client: { select: { name: true, phone: true } },
        service: { select: { name: true } },
      },
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
      take: 8,
    }),
    db.client.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={`Ciao, ${firstName} 👋`}
        description={`Ecco un riepilogo di oggi per ${session.user.businessName}.`}
      >
        <Button nativeButton={false} render={<Link href="/appointments" />}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Appuntamento
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Oggi"
          value={appointmentsToday}
          icon={Calendar}
          description="appuntamenti"
          iconClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Confermati"
          value={confirmedToday}
          icon={CheckCircle2}
          description="oggi"
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Annullati"
          value={cancelledToday}
          icon={XCircle}
          description="oggi"
          iconClassName="bg-red-50 text-red-600"
        />
        <StatCard
          title="No-Show"
          value={noShowCount}
          icon={AlertTriangle}
          description="totali"
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Clienti"
          value={totalClients}
          icon={Users}
          description="totali"
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming appointments */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Prossimi Appuntamenti</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/appointments" className="text-sm" />}>
              Vedi tutti
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nessun appuntamento in programma
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{appt.client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {appt.service.name} · {appt.startTime}–{appt.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {appt.appointmentDate.toLocaleDateString("it-IT", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <StatusBadge status={appt.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent clients */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Clienti Recenti</CardTitle>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/clients" className="text-sm" />}>
                Vedi tutti
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentClients.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nessun cliente ancora
                </div>
              ) : (
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {client.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{client.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{client.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking link */}
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Link Prenotazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                Condividi questo link con i tuoi clienti per le prenotazioni online.
              </p>
              <code className="block rounded-lg bg-background border px-3 py-2 text-xs break-all">
                /book/{session.user.businessSlug}
              </code>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/appointments" />}>
                <Calendar className="mr-2 h-4 w-4" />
                Gestisci Appuntamenti
              </Button>
              <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/clients" />}>
                <Users className="mr-2 h-4 w-4" />
                Gestisci Clienti
              </Button>
              <Button variant="outline" className="justify-start" nativeButton={false} render={<Link href="/settings" />}>
                <Plus className="mr-2 h-4 w-4" />
                Configura Attività
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
