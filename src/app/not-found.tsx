import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
        <FileQuestion className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-1">Pagina non trovata</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        La pagina che stai cercando non esiste o è stata spostata.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>Torna alla Home</Button>
    </div>
  );
}
