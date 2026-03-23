import { cn } from "@/lib/utils";
import { VAULT_STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("status-pill", STATUS_COLORS[status] || "bg-gray-100 text-gray-600", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 inline-block" />
      {VAULT_STATUS_LABELS[status] || status}
    </span>
  );
}
