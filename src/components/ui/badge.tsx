import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-ink-100 text-ink-700",
  outline: "border border-ink-300 text-ink-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("status-pill", variants[variant], className)}>
      {children}
    </span>
  );
}
