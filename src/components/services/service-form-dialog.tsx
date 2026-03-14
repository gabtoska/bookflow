"use client";

import { useTransition, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/shared/submit-button";
import { createService, updateService } from "@/actions/services";
import { toast } from "sonner";

interface ServiceData {
  id: string;
  name: string;
  durationMinutes: number;
  price: number | string | null;
  isActive: boolean;
}

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceData;
}

export function ServiceFormDialog({ open, onOpenChange, service }: ServiceFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const isEditing = !!service;

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setError("");
    formData.set("isActive", isActive ? "true" : "false");
    startTransition(async () => {
      const result = isEditing
        ? await updateService(service!.id, formData)
        : await createService(formData);

      if (result.success) {
        toast.success(isEditing ? "Servizio aggiornato" : "Servizio creato");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifica Servizio" : "Nuovo Servizio"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Aggiorna le informazioni del servizio."
              : "Inserisci le informazioni del nuovo servizio."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={service?.name ?? ""}
              required
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Durata (min) *</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min={1}
                defaultValue={service?.durationMinutes ?? 30}
                required
                aria-invalid={!!fieldErrors.durationMinutes}
              />
              {fieldErrors.durationMinutes && (
                <p className="text-xs text-destructive">{fieldErrors.durationMinutes}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prezzo (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min={0}
                defaultValue={service?.price != null ? Number(service.price) : ""}
                aria-invalid={!!fieldErrors.price}
              />
              {fieldErrors.price && (
                <p className="text-xs text-destructive">{fieldErrors.price}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium">
                Servizio attivo
              </Label>
              <p className="text-xs text-muted-foreground">
                I servizi inattivi non sono prenotabili
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {error && !Object.keys(fieldErrors).length && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <SubmitButton isPending={isPending}>
              {isEditing ? "Salva Modifiche" : "Crea Servizio"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
