import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const base = "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg gap-2";

const variants = {
  primary:   "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-sm",
  secondary: "bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300",
  ghost:     "text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  danger:    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
  outline:   "border border-ink-300 text-ink-700 hover:bg-ink-50 active:bg-ink-100",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 h-7",
  md: "text-sm px-4 py-2 h-9",
  lg: "text-sm px-6 py-2.5 h-10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
