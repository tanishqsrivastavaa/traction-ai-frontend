"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage as ChatMessageType, ExtractionState, Project } from "@/types";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { sendMessage as apiSendMessage, ApiError } from "@/lib/api";

interface ChatPanelProps {
  projectId: string;
  initialMessages: ChatMessageType[];
  mode: "doc" | "design";
  allComplete?: boolean;
  onExtractionUpdate?: (state: ExtractionState, allComplete: boolean) => void;
  onDesignGenerated?: (project: Project) => void;
  onModeChange?: (mode: "doc" | "design") => void;
}

export function ChatPanel({
  projectId,
  initialMessages,
  mode,
  allComplete = false,
  onExtractionUpdate,
  onDesignGenerated,
  onModeChange,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(
    async (content: string) => {
      // Optimistic user message
      const tempUserMsg: ChatMessageType = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      setIsTyping(true);

      try {
        const response = await apiSendMessage(projectId, content, mode);

        // Replace temp message + add AI response
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
          // The backend saves the user message, but the response only returns the assistant message
          // Keep the optimistic user message and add the assistant response
          return [...withoutTemp, tempUserMsg, response.message];
        });

        // Notify parent about extraction state
        if (onExtractionUpdate) {
          onExtractionUpdate(response.extraction_state, response.all_complete);
        }

        // Notify parent about design generation
        if (response.design_generation_triggered && response.project && onDesignGenerated) {
          onDesignGenerated(response.project);
        }
      } catch (err) {
        let errorContent = "Sorry, something went wrong. Please try again.";
        if (err instanceof ApiError && err.status === 422) {
          try {
            const body = JSON.parse(err.message);
            const detail = body.detail;
            const docs = detail?.incomplete_docs?.join(", ") || "";
            errorContent = `${detail?.message || "Documents incomplete."} Incomplete: ${docs}`;
          } catch {
            errorContent = "All 9 documents must be complete before generating designs.";
          }
        }
        const errorMsg: ChatMessageType = {
          id: `error-${Date.now()}`,
          project_id: projectId,
          role: "assistant",
          content: errorContent,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [projectId, mode, onExtractionUpdate, onDesignGenerated]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div
        className="flex-shrink-0 border-b hairline bg-[#fafafa]"
        style={{ padding: "clamp(20px, 2.5vw, 32px) clamp(24px, 3vw, 36px)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "18px" }}>
            <div
              className="flex items-center justify-center bg-black text-white text-[14px] font-bold flex-shrink-0"
              style={{ width: "44px", height: "44px" }}
            >
              T
            </div>
            <div>
              <p className="font-bold uppercase tracking-[0.08em]" style={{ fontSize: "15px" }}>
                Traction Agent
              </p>
              <p
                className="text-[12px] text-green-600 flex items-center"
                style={{ gap: "8px", marginTop: "6px" }}
              >
                <span
                  className="inline-block bg-green-500 flex-shrink-0"
                  style={{ width: "8px", height: "8px" }}
                />
                Online
              </p>
            </div>
          </div>

          {/* Mode toggle */}
          {onModeChange && (
            <div className="flex" style={{ gap: "4px" }}>
              <button
                onClick={() => onModeChange("doc")}
                className={`text-[11px] uppercase tracking-[0.1em] font-bold transition-colors ${
                  mode === "doc"
                    ? "bg-black text-white"
                    : "bg-transparent text-gray-300 hover:text-black"
                }`}
                style={{ padding: "8px 16px" }}
              >
                Doc
              </button>
              <button
                onClick={() => allComplete && onModeChange("design")}
                disabled={!allComplete}
                title={!allComplete ? "Complete all 9 docs first" : undefined}
                className={`text-[11px] uppercase tracking-[0.1em] font-bold transition-colors ${
                  !allComplete
                    ? "opacity-30 cursor-not-allowed bg-transparent text-gray-300"
                    : mode === "design"
                    ? "bg-black text-white"
                    : "bg-transparent text-gray-300 hover:text-black"
                }`}
                style={{ padding: "8px 16px" }}
              >
                Design
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ padding: "clamp(28px, 3vw, 48px) clamp(24px, 3vw, 36px)" }}
      >
        <div className="flex flex-col" style={{ gap: "clamp(24px, 3vw, 40px)" }}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <div className="flex justify-start" style={{ paddingLeft: "62px" }}>
              <div className="bg-[#f2f2f2]" style={{ padding: "22px 28px" }}>
                <div className="flex" style={{ gap: "10px" }}>
                  <span className="bg-gray-200 animate-pulse" style={{ width: "9px", height: "9px" }} />
                  <span className="bg-gray-200 animate-pulse" style={{ width: "9px", height: "9px", animationDelay: "0.2s" }} />
                  <span className="bg-gray-200 animate-pulse" style={{ width: "9px", height: "9px", animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t hairline flex-shrink-0">
        <div style={{ padding: "0 clamp(24px, 3vw, 36px)" }}>
          <ChatInput
            onSubmit={handleSend}
            disabled={isTyping}
            placeholder={mode === "design" ? "Describe changes for your deck..." : "Tell me about your startup..."}
          />
        </div>
      </div>
    </div>
  );
}
