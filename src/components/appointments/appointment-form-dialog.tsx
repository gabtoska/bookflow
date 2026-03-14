"use client";

import { useTransition, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/shared/submit-button";
import { createAppointment, updateAppointment } from "@/actions/appointments";
import { toast } from "sonner";

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
}

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: AppointmentData;
  clients: ClientOption[];
  services: ServiceOption[];
  /** Pre-fill date/time when creating from a calendar slot click */
  prefill?: { date?: string; startTime?: string };
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "In attesa" },
  { value: "CONFIRMED", label: "Confermato" },
  { value: "CANCELLED", label: "Annullato" },
  { value: "COMPLETED", label: "Completato" },
  { value: "NO_SHOW", label: "No-show" },
];

const SOURCE_OPTIONS = [
  { value: "MANUAL", label: "Manuale" },
  { value: "ONLINE_BOOKING", label: "Prenotazione online" },
];

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointment,
  clients,
  services,
  prefill,
}: AppointmentFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const isEditing = !!appointment;

  const today = new Date().toISOString().slice(0, 10);

  const [clientId, setClientId] = useState(appointment?.clientId ?? "");
  const [serviceId, setServiceId] = useState(appointment?.serviceId ?? "");
  const [status, setStatus] = useState(appointment?.status ?? "PENDING");
  const [source, setSource] = useState(appointment?.source ?? "MANUAL");
  const [noShow, setNoShow] = useState(appointment?.noShow ?? false);
  const [appointmentDate, setAppointmentDate] = useState(
    appointment?.appointmentDate?.slice(0, 10) ?? prefill?.date ?? today
  );
  const [startTime, setStartTime] = useState(
    appointment?.startTime ?? prefill?.startTime ?? "09:00"
  );
  const [endTime, setEndTime] = useState(appointment?.endTime ?? "09:30");

  // Auto-calculate endTime when service or startTime changes
  useEffect(() => {
    if (serviceId && startTime) {
      const selectedService = services.find((s) => s.id === serviceId);
      if (selectedService) {
        setEndTime(addMinutes(startTime, selectedService.durationMinutes));
      }
    }
  }, [serviceId, startTime, services]);

  // Reset form when dialog opens with different data
  useEffect(() => {
    if (open) {
      const t = new Date().toISOString().slice(0, 10);
      setClientId(appointment?.clientId ?? "");
      setServiceId(appointment?.serviceId ?? "");
      setStatus(appointment?.status ?? "PENDING");
      setSource(appointment?.source ?? "MANUAL");
      setNoShow(appointment?.noShow ?? false);
      setAppointmentDate(appointment?.appointmentDate?.slice(0, 10) ?? prefill?.date ?? t);
      setStartTime(appointment?.startTime ?? prefill?.startTime ?? "09:00");
      setEndTime(appointment?.endTime ?? "09:30");
      setFieldErrors({});
      setError("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id, prefill?.date, prefill?.startTime]);

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setError("");
    formData.set("clientId", clientId);
    formData.set("serviceId", serviceId);
    formData.set("startTime", startTime);
    formData.set("endTime", endTime);
    formData.set("status", status);
    formData.set("source", source);
    formData.set("noShow", noShow ? "true" : "false");
    startTransition(async () => {
      const result = isEditing
        ? await updateAppointment(appointment!.id, formData)
        : await createAppointment(formData);

      if (result.success) {
        toast.success(isEditing ? "Appuntamento aggiornato" : "Appuntamento creato");
        onOpenChange(false);
      } else {
        setError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Aggiorna le informazioni dell'appuntamento."
              : "Crea un nuovo appuntamento."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {/* Client select */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select value={clientId} onValueChange={(val) => val && setClientId(val)}>
              <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.clientId}>
                <SelectValue placeholder="Seleziona cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id} label={`${c.name} — ${c.phone}`}>
                    {c.name} — {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.clientId && (
              <p className="text-xs text-destructive">{fieldErrors.clientId}</p>
            )}
          </div>

          {/* Service select */}
          <div className="space-y-2">
            <Label>Servizio *</Label>
            <Select value={serviceId} onValueChange={(val) => val && setServiceId(val)}>
              <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.serviceId}>
                <SelectValue placeholder="Seleziona servizio..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id} label={`${s.name} (${s.durationMinutes} min)`}>
                    {s.name} ({s.durationMinutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.serviceId && (
              <p className="text-xs text-destructive">{fieldErrors.serviceId}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="appointmentDate">Data *</Label>
            <Input
              id="appointmentDate"
              name="appointmentDate"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              aria-invalid={!!fieldErrors.appointmentDate}
            />
            {fieldErrors.appointmentDate && (
              <p className="text-xs text-destructive">{fieldErrors.appointmentDate}</p>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Inizio *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                aria-invalid={!!fieldErrors.startTime}
              />
              {fieldErrors.startTime && (
                <p className="text-xs text-destructive">{fieldErrors.startTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Fine *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                aria-invalid={!!fieldErrors.endTime}
              />
              {fieldErrors.endTime && (
                <p className="text-xs text-destructive">{fieldErrors.endTime}</p>
              )}
            </div>
          </div>

          {/* Status & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stato *</Label>
              <Select value={status} onValueChange={(val) => val && setStatus(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Origine</Label>
              <Select value={source} onValueChange={(val) => val && setSource(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={appointment?.notes ?? ""}
              rows={2}
              placeholder="Note sull'appuntamento..."
            />
          </div>

          {/* No-show toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm font-medium">No-show</Label>
              <p className="text-xs text-muted-foreground">
                Il cliente non si è presentato
              </p>
            </div>
            <Switch checked={noShow} onCheckedChange={setNoShow} />
          </div>

          {error && !Object.keys(fieldErrors).length && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <SubmitButton isPending={isPending}>
              {isEditing ? "Salva Modifiche" : "Crea Appuntamento"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
