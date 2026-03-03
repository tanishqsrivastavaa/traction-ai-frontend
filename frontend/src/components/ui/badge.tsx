import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "generating"
  | "draft"
  | "finalized"
  | "shared"
  | "ready"
  | "error"
  | "pending"
  | "applied"
  | "dismissed";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold uppercase tracking-[0.1em] border",
        variant === "default" && "border-gray-100 text-gray-300",
        variant === "generating" && "border-amber-300 text-amber-600 bg-amber-50",
        variant === "draft" && "border-gray-100 text-gray-300 bg-[#fafafa]",
        variant === "finalized" && "border-accent/30 text-accent bg-accent/[0.04]",
        variant === "shared" && "border-green-300 text-green-700 bg-green-50",
        variant === "ready" && "border-green-300 text-green-700 bg-green-50",
        variant === "error" && "border-red-300 text-red-600 bg-red-50",
        variant === "pending" && "border-gray-100 text-gray-300 bg-[#fafafa]",
        variant === "applied" && "border-accent/30 text-accent bg-accent/[0.04]",
        variant === "dismissed" && "border-gray-100 text-gray-200",
        className
      )}
      style={{ padding: "4px 10px" }}
    >
      {children}
    </span>
  );
}
