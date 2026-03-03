import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        <label
          htmlFor={inputId}
          className="block text-[12px] font-bold uppercase tracking-[0.14em] text-black"
          style={{ marginBottom: "12px" }}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border-b-2 border-gray-100 bg-transparent text-[17px]",
            "placeholder:text-gray-200 focus:outline-none focus:border-black transition-colors",
            error && "border-red-600",
            className
          )}
          style={{ padding: "16px 0" }}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-red-600" style={{ marginTop: "8px" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
