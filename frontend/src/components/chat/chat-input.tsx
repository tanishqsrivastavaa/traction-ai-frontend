"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSubmit(trimmed);
      setValue("");
    },
    [value, disabled, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end bg-white"
      style={{
        padding: "clamp(20px, 2.5vw, 32px) 0",
        gap: "clamp(16px, 2vw, 28px)",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none border-b-2 border-gray-100 bg-transparent placeholder:text-gray-200 focus:outline-none focus:border-black transition-colors"
        style={{ padding: "16px 0", fontSize: "16px" }}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="group inline-flex items-center flex-shrink-0 bg-black text-white font-bold uppercase tracking-[0.1em] disabled:opacity-15 hover:bg-accent transition-colors"
        style={{ padding: "18px 32px", fontSize: "13px" }}
        aria-label="Send message"
      >
        Send
        <span
          className="inline-block ml-5 transition-transform group-hover:translate-x-1"
          style={{ fontSize: "18px" }}
        >
          &rarr;
        </span>
      </button>
    </form>
  );
}
