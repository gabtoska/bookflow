import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ReminderStatusType = "NONE" | "PENDING" | "SENT" | "FAILED";

const reminderConfig: Record<ReminderStatusType, { label: string; variant: string }> = {
  NONE: { label: "Non inviato", variant: "bg-gray-50 text-gray-500 border-gray-200" },
  PENDING: { label: "In invio...", variant: "bg-amber-50 text-amber-700 border-amber-200" },
  SENT: { label: "Inviato", variant: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  FAILED: { label: "Fallito", variant: "bg-red-50 text-red-700 border-red-200" },
};

interface ReminderBadgeProps {
  status: ReminderStatusType;
  className?: string;
}

export function ReminderBadge({ status, className }: ReminderBadgeProps) {
  const config = reminderConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium", config.variant, className)}
    >
      {config.label}
    </Badge>
  );
}
