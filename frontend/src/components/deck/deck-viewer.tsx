"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";

const DeckViewerClient = dynamic(
  () =>
    import("./deck-viewer-client").then((mod) => ({
      default: mod.DeckViewerClient,
    })),
  {
    ssr: false,
    loading: () => <DeckViewerSkeleton />,
  }
);

function DeckViewerSkeleton() {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center border border-black">
      <div className="w-16 h-0.5 bg-black animate-pulse" />
    </div>
  );
}

/**
 * Inject CSS into the generated HTML to fix common overlay stacking issues.
 *
 * LLM-generated decks sometimes misposition semi-transparent overlay elements
 * (e.g. video-overlay) at incorrect z-index levels or outside individual slides,
 * causing a grey washed-out appearance over the presentation content.
 */
function fixOverlayStacking(html: string): string {
  const fixStyles = `<style data-deck-fix>
[class*="overlay"] {
  z-index: 1 !important;
  pointer-events: none !important;
}
.slide-content,
[class*="slide-content"],
.slide > [class*="content"]:not([class*="overlay"]) {
  z-index: 2 !important;
  position: relative !important;
}
.controls-bar, .keyboard-hint, .progress, .slide-counter, .progress-dots {
  z-index: 100 !important;
}
</style>`;

  if (html.includes("</head>")) {
    return html.replace("</head>", fixStyles + "</head>");
  }
  if (html.includes("</body>")) {
    return html.replace("</body>", fixStyles + "</body>");
  }
  return html + fixStyles;
}

interface DeckViewerProps {
  slides: string[];
  fullHtml?: string;
  readOnly?: boolean;
  onSlideChange?: (index: number) => void;
}

export function DeckViewer(props: DeckViewerProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Reset loading state when HTML content changes (e.g. regeneration)
  useEffect(() => {
    setIframeLoaded(false);
  }, [props.fullHtml]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  if (props.fullHtml) {
    const processedHtml = fixOverlayStacking(props.fullHtml);

    return (
      <div className="relative w-full h-full">
        {!iframeLoaded && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="w-16 h-0.5 bg-black animate-pulse" />
          </div>
        )}
        <iframe
          srcDoc={processedHtml}
          className="w-full h-full border-0"
          style={{ display: "block", background: "white", opacity: iframeLoaded ? 1 : 0 }}
          title="Pitch Deck"
          sandbox="allow-scripts allow-same-origin"
          onLoad={handleIframeLoad}
        />
      </div>
    );
  }

  return <DeckViewerClient slides={props.slides} readOnly={props.readOnly} onSlideChange={props.onSlideChange} />;
}
