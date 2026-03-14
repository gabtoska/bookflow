import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type AppointmentStatusType = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

const statusConfig: Record<AppointmentStatusType, { label: string; variant: string }> = {
  PENDING: { label: "In Attesa", variant: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED: { label: "Confermato", variant: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED: { label: "Annullato", variant: "bg-red-100 text-red-800 border-red-200" },
  COMPLETED: { label: "Completato", variant: "bg-blue-100 text-blue-800 border-blue-200" },
  NO_SHOW: { label: "No Show", variant: "bg-gray-100 text-gray-800 border-gray-200" },
};

interface StatusBadgeProps {
  status: AppointmentStatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.variant, className)}
    >
      {config.label}
    </Badge>
  );
}
