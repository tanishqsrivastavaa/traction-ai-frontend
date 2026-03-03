import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold uppercase tracking-[0.08em]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        "disabled:opacity-25 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-black text-white hover:bg-gray-400",
        variant === "secondary" &&
          "bg-white text-black border border-black hover:bg-black hover:text-white",
        variant === "ghost" &&
          "bg-transparent text-black hover:bg-black/[0.04]",
        size === "sm" && "px-5 py-2.5 text-[11px]",
        size === "md" && "px-6 py-3 text-[11px]",
        size === "lg" && "px-8 py-4 text-[12px]",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
