import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ padding: "clamp(32px, 4vw, 64px)" }}>
      <div className="text-center max-w-[560px]">
        <p className="swiss-label text-gray-200" style={{ marginBottom: "12px" }}>
          Not Found
        </p>
        <h1 className="text-display font-black uppercase tracking-tight leading-none">
          404
        </h1>
        <p
          className="text-body-lg text-gray-300 leading-relaxed mx-auto"
          style={{ marginTop: "16px" }}
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        <div style={{ marginTop: "clamp(32px, 4vw, 48px)" }}>
          <Link
            href="/dashboard"
            className="group inline-flex items-center bg-black text-white font-bold uppercase tracking-[0.12em] hover:bg-accent transition-colors"
            style={{ padding: "18px 36px", fontSize: "13px" }}
          >
            Go to Dashboard
            <span
              className="inline-block ml-5 transition-transform group-hover:translate-x-1"
              style={{ fontSize: "18px" }}
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
