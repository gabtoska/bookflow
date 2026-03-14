"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { deleteService } from "@/actions/services";
import { toast } from "sonner";
import { Plus, Scissors, Pencil, Trash2, Clock } from "lucide-react";

interface ServiceData {
  id: string;
  name: string;
  durationMinutes: number;
  price: number | string | null;
  isActive: boolean;
  _count: { appointments: number };
}

export function ServicesPageContent({ services }: { services: ServiceData[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceData | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servizi"
        description="Gestisci i servizi offerti dalla tua attività."
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Servizio
        </Button>
      </PageHeader>

      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Nessun servizio"
          description="Aggiungi il tuo primo servizio per iniziare."
        >
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Servizio
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium">{service.name}</h3>
                      {!service.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inattivo
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {service.durationMinutes} min
                      </span>
                      {service.price != null && (
                        <span className="font-medium text-foreground">
                          €{Number(service.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {service._count.appointments} prenotazion
                        {service._count.appointments === 1 ? "e" : "i"}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setEditService(service)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeleteTarget(service)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editService && (
        <ServiceFormDialog
          open={!!editService}
          onOpenChange={(open) => !open && setEditService(null)}
          service={editService}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Elimina Servizio"
        description={`Sei sicuro di voler eliminare il servizio "${deleteTarget?.name}"? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const result = await deleteService(deleteTarget.id);
          if (result.success) {
            toast.success("Servizio eliminato");
          } else {
            toast.error(result.error);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
