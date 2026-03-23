import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 rounded-lg border text-sm bg-white transition-colors resize-vertical min-h-[80px]",
            "border-ink-200 text-ink-900 placeholder:text-ink-400",
            "focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500",
            error ? "border-red-400" : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
