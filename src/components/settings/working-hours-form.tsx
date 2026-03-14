"use client";

import { useTransition, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/shared/submit-button";
import { updateWorkingHours } from "@/actions/settings";
import { toast } from "sonner";

const DAYS = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

interface WorkingHourData {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export function WorkingHoursForm({
  workingHours: initialHours,
}: {
  workingHours: WorkingHourData[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Build a complete 7-day array, filling missing days
  const [hours, setHours] = useState<WorkingHourData[]>(() =>
    Array.from({ length: 7 }, (_, i) => {
      const existing = initialHours.find((h) => h.dayOfWeek === i);
      return existing ?? { dayOfWeek: i, isOpen: false, startTime: "09:00", endTime: "18:00" };
    })
  );

  function updateDay(dayOfWeek: number, updates: Partial<WorkingHourData>) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...updates } : h))
    );
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await updateWorkingHours(JSON.stringify(hours));
      if (result.success) {
        toast.success("Orari aggiornati");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Orari di Apertura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {hours.map((wh) => (
            <div
              key={wh.dayOfWeek}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3 sm:w-36">
                <Switch
                  checked={wh.isOpen}
                  onCheckedChange={(checked) =>
                    updateDay(wh.dayOfWeek, { isOpen: !!checked })
                  }
                />
                <Label className="text-sm font-medium">{DAYS[wh.dayOfWeek]}</Label>
              </div>

              {wh.isOpen ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={wh.startTime}
                    onChange={(e) =>
                      updateDay(wh.dayOfWeek, { startTime: e.target.value })
                    }
                    className="w-auto"
                  />
                  <span className="text-sm text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={wh.endTime}
                    onChange={(e) =>
                      updateDay(wh.dayOfWeek, { endTime: e.target.value })
                    }
                    className="w-auto"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Chiuso</span>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <SubmitButton isPending={isPending} className="w-full sm:w-auto">
          Salva Orari
        </SubmitButton>
      </CardContent>
    </Card>
  );
}
