import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
      style={{ gap: "18px" }}
    >
      {/* Agent avatar for assistant messages */}
      {!isUser && (
        <div
          className="flex-shrink-0 flex items-center justify-center bg-black text-white text-[13px] font-bold"
          style={{ width: "44px", height: "44px", marginTop: "4px" }}
        >
          T
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%]",
          isUser
            ? "bg-accent/[0.06] border border-accent/20 text-black"
            : "bg-[#f2f2f2] text-black"
        )}
        style={{ padding: "clamp(20px, 2.5vw, 28px) clamp(22px, 2.5vw, 32px)" }}
      >
        <p className="whitespace-pre-wrap" style={{ fontSize: "15px", lineHeight: "1.8" }}>
          {message.content}
        </p>
        <time
          className="block text-[11px] text-gray-200"
          style={{ marginTop: "14px" }}
        >
          {new Date(message.created_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  );
}
