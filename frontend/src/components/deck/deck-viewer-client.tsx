"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "reveal.js/dist/reveal.css";

interface DeckViewerClientProps {
  slides: string[];
  readOnly?: boolean;
  onSlideChange?: (index: number) => void;
}

export function DeckViewerClient({
  slides,
  readOnly = false,
  onSlideChange,
}: DeckViewerClientProps) {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<RevealInstance | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSlideChanged = useCallback(
    (event: Record<string, unknown>) => {
      const indexh = event.indexh as number;
      setCurrentSlide(indexh);
      onSlideChange?.(indexh);
    },
    [onSlideChange]
  );

  useEffect(() => {
    let instance: RevealInstance | null = null;
    let mounted = true;

    async function initReveal() {
      if (!deckRef.current) return;

      const Reveal = (await import("reveal.js")).default;

      if (!mounted) return;

      instance = new Reveal(deckRef.current, {
        embedded: true,
        hash: false,
        controls: !readOnly,
        controlsLayout: "edges",
        progress: true,
        center: true,
        transition: "none",
        width: 960,
        height: 540,
        margin: 0,
        minScale: 0.2,
        maxScale: 2,
      });

      await instance.initialize();

      if (!mounted) {
        instance.destroy();
        return;
      }

      revealRef.current = instance;
      instance.on("slidechanged", handleSlideChanged);
    }

    initReveal();

    return () => {
      mounted = false;
      if (instance) {
        instance.off("slidechanged", handleSlideChanged);
        instance.destroy();
        revealRef.current = null;
      }
    };
  }, [slides, readOnly, handleSlideChanged]);

  return (
    <div className="relative w-full h-full bg-white">
      {/* Slide counter */}
      <div className="absolute top-3 right-3 z-10 px-2 py-1 text-xs font-mono bg-white border border-black text-gray-300">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Reveal.js container */}
      <div
        ref={deckRef}
        className="reveal"
        style={{ width: "100%", height: "100%" }}
      >
        <div className="slides">
          {slides.map((html, i) => (
            <section
              key={`slide-${i}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Internal types for Reveal.js instance and events */
type RevealEventListener = (event: Record<string, unknown>) => void;

type RevealInstance = {
  initialize: () => Promise<unknown>;
  destroy: () => void;
  on: (type: string, listener: RevealEventListener) => void;
  off: (type: string, listener: RevealEventListener) => void;
  slide: (h?: number, v?: number, f?: number) => void;
};
