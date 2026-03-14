"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  children: React.ReactNode;
  isPending: boolean;
  className?: string;
}

export function SubmitButton({ children, isPending, className }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isPending} className={className}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
