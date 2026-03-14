"use client";

import { useTransition, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { updateBusinessSettings } from "@/actions/settings";
import { toast } from "sonner";

interface BusinessData {
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  slotIntervalMinutes: number;
}

export function BusinessSettingsForm({ business }: { business: BusinessData }) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setFieldErrors({});
    setError("");
    startTransition(async () => {
      const result = await updateBusinessSettings(formData);
      if (result.success) {
        toast.success("Impostazioni salvate");
      } else {
        setError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Informazioni Attività</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome attività *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={business.name}
                required
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL prenotazione) *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={business.slug}
                required
                aria-invalid={!!fieldErrors.slug}
              />
              <p className="text-xs text-muted-foreground">
                bookflow.it/book/{business.slug}
              </p>
              {fieldErrors.slug && (
                <p className="text-xs text-destructive">{fieldErrors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={business.phone ?? ""}
                aria-invalid={!!fieldErrors.phone}
              />
              {fieldErrors.phone && (
                <p className="text-xs text-destructive">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                name="address"
                defaultValue={business.address ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slotIntervalMinutes">Intervallo slot (minuti) *</Label>
              <Input
                id="slotIntervalMinutes"
                name="slotIntervalMinutes"
                type="number"
                min={5}
                max={120}
                defaultValue={business.slotIntervalMinutes}
                required
                aria-invalid={!!fieldErrors.slotIntervalMinutes}
              />
              <p className="text-xs text-muted-foreground">
                Determina la granularità degli orari disponibili per la prenotazione.
              </p>
              {fieldErrors.slotIntervalMinutes && (
                <p className="text-xs text-destructive">{fieldErrors.slotIntervalMinutes}</p>
              )}
            </div>
          </div>

          {error && !Object.keys(fieldErrors).length && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <SubmitButton isPending={isPending}>Salva Impostazioni</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
