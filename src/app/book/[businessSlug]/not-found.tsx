import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookingNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
        <span className="text-2xl font-bold text-muted-foreground">?</span>
      </div>
      <h2 className="text-xl font-bold mb-1">Attività non trovata</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        L&apos;attività che stai cercando non esiste o il link non è valido.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>Torna alla Home</Button>
    </div>
  );
}
