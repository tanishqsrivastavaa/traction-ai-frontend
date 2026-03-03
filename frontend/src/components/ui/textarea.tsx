import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="swiss-label text-black block mb-3">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border border-gray-100 bg-transparent p-4 text-[15px] resize-none",
            "placeholder:text-gray-200 focus:outline-none focus:border-black",
            error && "border-red-600",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red-600 mt-2">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
