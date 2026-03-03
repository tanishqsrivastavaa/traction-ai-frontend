import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav bar — consistent with landing page */}
      <header className="flex items-center h-[72px] border-b hairline-dark">
        <div
          className="flex items-center h-full border-r hairline-dark flex-shrink-0"
          style={{ padding: "0 clamp(24px, 3vw, 56px)" }}
        >
          <Link
            href="/"
            className="text-[22px] font-black tracking-tight whitespace-nowrap"
          >
            TRACTION<span className="text-accent">.</span>
          </Link>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex items-center h-full flex-shrink-0 border-l hairline-dark">
          <Link
            href="/login"
            className="flex items-center h-full bg-black text-white swiss-label hover:bg-gray-400 transition-colors whitespace-nowrap"
            style={{ padding: "0 clamp(32px, 3vw, 64px)" }}
          >
            Sign In&ensp;&rarr;
          </Link>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex-1 flex">
        {/* Left: form */}
        <div className="flex-1 flex items-center justify-center bg-[#fafafa]" style={{ padding: "0 clamp(40px, 5vw, 96px)" }}>
          <div className="w-full max-w-[560px]" style={{ padding: "clamp(40px, 5vw, 80px) 0" }}>
            {children}
          </div>
        </div>

        {/* Right: decorative panel */}
        <div className="hidden lg:flex lg:w-[40%] items-center justify-center bg-white border-l hairline">
          <div className="flex flex-col items-center gap-10">
            <h2 className="text-display font-black uppercase tracking-tight leading-[0.88] text-gray-100 text-center select-none">
              Build.
              <br />
              Pitch.
              <br />
              Win.
            </h2>
            <div className="w-16 h-px bg-gray-100" />
            <p className="swiss-label text-gray-200 text-center">
              AI-powered pitch decks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
