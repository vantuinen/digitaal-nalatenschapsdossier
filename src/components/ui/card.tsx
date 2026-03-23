import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated";
  hover?: boolean;
}

export function Card({ children, className, variant = "default", hover }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl",
        variant === "default" && "shadow-card border border-ink-100",
        variant === "bordered" && "border border-ink-200",
        variant === "elevated" && "shadow-vault border border-ink-100",
        hover && "vault-card cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-b border-ink-100", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-t border-ink-100 bg-ink-50/50 rounded-b-xl", className)}>{children}</div>;
}
