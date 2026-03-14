"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-lg font-bold mb-1">Errore nel caricamento</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Non è stato possibile caricare questa pagina. Riprova o torna alla dashboard.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>Riprova</Button>
        <Button nativeButton={false} render={<Link href="/dashboard" />}>Dashboard</Button>
      </div>
    </div>
  );
}
