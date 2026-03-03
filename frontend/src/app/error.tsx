"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ padding: "clamp(32px, 4vw, 64px)" }}>
      <div className="text-center max-w-[560px]">
        <p className="swiss-label text-gray-200" style={{ marginBottom: "12px" }}>
          Error
        </p>
        <h1 className="text-display font-black uppercase tracking-tight leading-none">
          Something went wrong
        </h1>
        <p
          className="text-body-lg text-gray-300 leading-relaxed mx-auto"
          style={{ marginTop: "16px" }}
        >
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        <div style={{ marginTop: "clamp(32px, 4vw, 48px)" }}>
          <button
            onClick={reset}
            className="group inline-flex items-center bg-black text-white font-bold uppercase tracking-[0.12em] hover:bg-accent transition-colors"
            style={{ padding: "18px 36px", fontSize: "13px" }}
          >
            Try Again
            <span
              className="inline-block ml-5 transition-transform group-hover:translate-x-1"
              style={{ fontSize: "18px" }}
            >
              &rarr;
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
