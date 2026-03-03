"use client";

import React from "react";

/**
 * Simple markdown renderer — handles headings, bold, italic, lists,
 * horizontal rules, and paragraphs without any external dependencies.
 */

function parseInline(text: string): (string | React.ReactElement)[] {
  const parts: (string | React.ReactElement)[] = [];
  // Match **bold**, *italic*, and `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code
          key={key++}
          className="text-[13px] bg-gray-100 rounded px-1 py-0.5"
          style={{ fontFamily: "monospace" }}
        >
          {match[4]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MarkdownRenderer({ content, className = "", style }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: React.ReactElement[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(
        <hr key={key++} className="border-gray-200" style={{ margin: "24px 0" }} />
      );
      i++;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const sizes: Record<number, string> = {
        1: "text-[22px] font-bold",
        2: "text-[18px] font-bold",
        3: "text-[16px] font-bold",
        4: "text-[15px] font-bold",
        5: "text-[14px] font-bold",
        6: "text-[13px] font-bold uppercase tracking-wide",
      };
      elements.push(
        <div
          key={key++}
          className={`${sizes[level] || sizes[4]} text-black`}
          style={{ marginTop: elements.length > 0 ? "28px" : "0", marginBottom: "12px" }}
        >
          {parseInline(text)}
        </div>
      );
      i++;
      continue;
    }

    // Unordered list (collect consecutive - or * items)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={key++} style={{ margin: "12px 0", paddingLeft: "24px" }}>
          {items.map((item, idx) => (
            <li
              key={idx}
              className="text-[15px] text-gray-500 leading-relaxed"
              style={{ marginBottom: "6px", listStyleType: "disc" }}
            >
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (collect consecutive 1. 2. etc.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} style={{ margin: "12px 0", paddingLeft: "24px" }}>
          {items.map((item, idx) => (
            <li
              key={idx}
              className="text-[15px] text-gray-500 leading-relaxed"
              style={{ marginBottom: "6px", listStyleType: "decimal" }}
            >
              {parseInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s+/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      elements.push(
        <p
          key={key++}
          className="text-[15px] text-gray-500 leading-relaxed"
          style={{ marginBottom: "16px" }}
        >
          {parseInline(paragraphLines.join(" "))}
        </p>
      );
    }
  }

  return <div className={className} style={style}>{elements}</div>;
}
