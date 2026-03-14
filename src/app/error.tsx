"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-xl font-bold mb-1">Qualcosa è andato storto</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Si è verificato un errore imprevisto. Riprova o contatta il supporto se il problema persiste.
      </p>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}
