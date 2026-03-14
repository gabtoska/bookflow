"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ReminderBadge } from "@/components/shared/reminder-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog";
import { AppointmentFilters } from "@/components/appointments/appointment-filters";
import { deleteAppointment } from "@/actions/appointments";
import { sendReminder } from "@/actions/reminders";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus, Calendar, Pencil, Trash2, Clock, Send, List, CalendarDays } from "lucide-react";

// Lazy-load FullCalendar — avoids SSR issues with its CSS injection
const AppointmentsCalendar = dynamic(
  () =>
    import("@/components/appointments/appointments-calendar").then(
      (m) => ({ default: m.AppointmentsCalendar })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[660px] animate-pulse rounded-xl border bg-muted/30" />
    ),
  }
);

interface ClientOption {
  id: string;
  name: string;
  phone: string;
}

interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
}

interface AppointmentData {
  id: string;
  clientId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  notes: string | null;
  noShow: boolean;
  reminderStatus: string;
  client: { name: string; phone: string };
  service: { name: string };
}

interface AppointmentsPageContentProps {
  appointments: AppointmentData[];
  clients: ClientOption[];
  services: ServiceOption[];
}

export function AppointmentsPageContent({
  appointments,
  clients,
  services,
}: AppointmentsPageContentProps) {
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [createOpen, setCreateOpen] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<{ date: string; startTime: string } | undefined>();
  const [editAppt, setEditAppt] = useState<AppointmentData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentData | null>(null);
  const [reminderTarget, setReminderTarget] = useState<AppointmentData | null>(null);

  function handleCalendarEventClick(appointmentId: string) {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (appt) setEditAppt(appt);
  }

  function handleCalendarSlotSelect(date: string, startTime: string) {
    setCreatePrefill({ date, startTime });
    setCreateOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appuntamenti"
        description="Gestisci e monitora i tuoi appuntamenti."
      >
        <Button onClick={() => { setCreatePrefill(undefined); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Appuntamento
        </Button>
      </PageHeader>

      {/* View tabs */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
        <button
          onClick={() => setActiveTab("list")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === "list"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="h-3.5 w-3.5" />
          Lista
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === "calendar"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Calendario
        </button>
      </div>

      {/* ─── Calendar view ─── */}
      {activeTab === "calendar" && (
        <AppointmentsCalendar
          appointments={appointments}
          onEventClick={handleCalendarEventClick}
          onSlotSelect={handleCalendarSlotSelect}
        />
      )}

      {/* ─── List view ─── */}
      {activeTab === "list" && (
        <>
          <AppointmentFilters />

      {appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nessun appuntamento"
          description="Non ci sono appuntamenti per i filtri selezionati."
        >
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Appuntamento
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const dateStr = new Date(appt.appointmentDate).toLocaleDateString("it-IT", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <Card key={appt.id} className="shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{appt.client.name}</p>
                          <StatusBadge status={appt.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"} />
                          <ReminderBadge status={appt.reminderStatus as "NONE" | "PENDING" | "SENT" | "FAILED"} />
                          {appt.noShow && (
                            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              No-show
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {appt.service.name} · {dateStr}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">
                          {appt.startTime}–{appt.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                      {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Invia promemoria"
                          onClick={() => setReminderTarget(appt)}
                        >
                          <Send className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setEditAppt(appt)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(appt)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {appt.notes && (
                    <p className="mt-2 text-xs text-muted-foreground italic pl-13">
                      {appt.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

        </>
      )}

      {/* ─── Dialogs (shared between list and calendar views) ───────────── */}
      <AppointmentFormDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setCreatePrefill(undefined);
        }}
        clients={clients}
        services={services}
        prefill={createPrefill}
      />

      {editAppt && (
        <AppointmentFormDialog
          open={!!editAppt}
          onOpenChange={(open) => !open && setEditAppt(null)}
          appointment={editAppt}
          clients={clients}
          services={services}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Elimina Appuntamento"
        description={`Sei sicuro di voler eliminare l'appuntamento di ${deleteTarget?.client.name}? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const result = await deleteAppointment(deleteTarget.id);
          if (result.success) {
            toast.success("Appuntamento eliminato");
          } else {
            toast.error(result.error);
          }
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!reminderTarget}
        onOpenChange={(open) => !open && setReminderTarget(null)}
        title="Invia Promemoria"
        description={`Inviare un promemoria WhatsApp a ${reminderTarget?.client.name} (${reminderTarget?.client.phone}) per l'appuntamento del ${reminderTarget ? new Date(reminderTarget.appointmentDate).toLocaleDateString("it-IT") : ""}?`}
        confirmLabel="Invia"
        variant="default"
        onConfirm={async () => {
          if (!reminderTarget) return;
          const result = await sendReminder(reminderTarget.id);
          if (result.success) {
            toast.success("Promemoria inviato con successo");
          } else {
            toast.error(result.error);
          }
          setReminderTarget(null);
        }}
      />
    </div>
  );
}
