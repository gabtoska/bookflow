"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { deleteClient } from "@/actions/clients";
import { toast } from "sonner";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";

interface ClientData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  lastAppointmentAt: Date | null;
  _count: { appointments: number };
}

export function ClientsPageContent({ clients }: { clients: ClientData[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientData | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Clienti" description="Gestisci la tua rubrica clienti.">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Cliente
        </Button>
      </PageHeader>

      <SearchInput placeholder="Cerca per nome o telefono..." />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nessun cliente"
          description="Aggiungi il tuo primo cliente per iniziare."
        >
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Cliente
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {client.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{client.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{client.phone}</p>
                    {client.email && (
                      <p className="truncate text-sm text-muted-foreground">{client.email}</p>
                    )}
                    {client.lastAppointmentAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ultimo appuntamento:{" "}
                        {new Date(client.lastAppointmentAt).toLocaleDateString("it-IT")}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {client._count.appointments} appuntament
                        {client._count.appointments === 1 ? "o" : "i"}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setEditClient(client)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeleteTarget(client)}
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

      <ClientFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editClient && (
        <ClientFormDialog
          open={!!editClient}
          onOpenChange={(open) => !open && setEditClient(null)}
          client={editClient}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Elimina Cliente"
        description={`Sei sicuro di voler eliminare il cliente "${deleteTarget?.name}"? Questa azione non può essere annullata e cancellerà anche i relativi appuntamenti.`}
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const result = await deleteClient(deleteTarget.id);
          if (result.success) {
            toast.success("Cliente eliminato");
          } else {
            toast.error(result.error);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
