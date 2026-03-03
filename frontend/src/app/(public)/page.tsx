import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* ═══ NAVIGATION ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b hairline-dark">
        <div className="flex items-center h-[72px] w-full">
          {/* Logo — generous padding */}
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

          {/* Nav links — centered with wide gaps */}
          <div className="hidden md:flex flex-1 items-center justify-center h-full">
            <div
              className="flex items-center h-full"
              style={{ gap: "clamp(48px, 6vw, 96px)" }}
            >
              <Link
                href="/work"
                className="swiss-label text-gray-300 hover:text-black transition-colors h-full flex items-center"
              >
                Work
              </Link>
              <Link
                href="/services"
                className="swiss-label text-gray-300 hover:text-black transition-colors h-full flex items-center"
              >
                Services
              </Link>
              <Link
                href="/login"
                className="swiss-label text-gray-300 hover:text-black transition-colors h-full flex items-center"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* CTA button — right column */}
          <div className="hidden md:flex items-center h-full flex-shrink-0 border-l hairline-dark">
            <Link
              href="/signup"
              className="group flex items-center h-full bg-black text-white swiss-label hover:bg-gray-400 transition-colors whitespace-nowrap"
              style={{ padding: "0 clamp(32px, 3vw, 64px)" }}
            >
              Start Project
              <span
                className="inline-block ml-5 transition-transform group-hover:translate-x-1"
                style={{ fontSize: "18px" }}
              >
                &rarr;
              </span>
            </Link>
          </div>

          {/* Mobile menu */}
          <button
            className="md:hidden ml-auto px-8 flex flex-col gap-[6px]"
            aria-label="Menu"
          >
            <span className="block w-6 h-[1.5px] bg-black" />
            <span className="block w-6 h-[1.5px] bg-black" />
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-[72px] min-h-screen flex">
        {/* Vertical sidebar label */}
        <div className="hidden lg:flex items-center justify-center w-[72px] border-r hairline flex-shrink-0">
          <span className="vertical-label text-gray-200">Manifesto</span>
        </div>

        {/* Hero content */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ padding: "clamp(64px, 8vw, 128px) clamp(48px, 6vw, 120px)" }}
        >
          <h1 className="text-display-xl font-black uppercase tracking-tight leading-[0.88] animate-fade-up">
            Turn
            <br />
            any idea
            <br />
            into a
            <br />
            pitch.
          </h1>

          {/* Description + meta row */}
          <div
            className="flex flex-col lg:flex-row lg:items-end animate-fade-up delay-2"
            style={{ marginTop: "clamp(48px, 5vw, 80px)", gap: "clamp(32px, 4vw, 80px)" }}
          >
            <p className="text-body-lg text-gray-300 max-w-[520px] leading-relaxed">
              Enter a prompt. Get a complete pitch deck,
              financial projections, market research, and
              everything investors need to say yes.
            </p>

            <div className="animate-fade-up delay-3">
              <div className="border-t hairline-dark pt-5">
                <span className="swiss-label text-gray-200">
                  EST. 2026 — Bangalore
                </span>
              </div>
            </div>
          </div>

          {/* CTA — large, prominent */}
          <div className="animate-fade-up delay-4" style={{ marginTop: "clamp(40px, 5vw, 72px)" }}>
            <Link
              href="/signup"
              className="group inline-flex items-center bg-black text-white font-bold uppercase tracking-[0.12em] hover:bg-accent transition-colors"
              style={{ padding: "24px 48px", fontSize: "15px", letterSpacing: "0.14em" }}
            >
              Start Building — Free
              <span
                className="inline-block ml-6 transition-transform group-hover:translate-x-1"
                style={{ fontSize: "20px" }}
              >
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section id="capabilities" className="border-t hairline-dark">
        <div
          className="w-full"
          style={{ padding: "clamp(64px, 8vw, 120px) clamp(48px, 6vw, 120px)" }}
        >
          {/* Section header — centered */}
          <div className="flex items-center gap-6 animate-fade-in" style={{ marginBottom: "clamp(48px, 6vw, 96px)" }}>
            <span className="swiss-label text-gray-200">
              Capabilities
            </span>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="swiss-label text-gray-200">
              What you get
            </span>
          </div>

          {/* 4-column grid with generous spacing */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ columnGap: "clamp(40px, 5vw, 80px)", rowGap: "clamp(48px, 5vw, 72px)" }}
          >
            {[
              {
                n: "01",
                title: "AI-Generated Decks",
                desc: "Complete pitch decks from a single prompt. HTML, CSS, and JavaScript slides ready to present.",
              },
              {
                n: "02",
                title: "Business Documents",
                desc: "SWOT analysis, financial projections, market research, and timelines generated automatically.",
              },
              {
                n: "03",
                title: "Investor Sharing",
                desc: "Share your complete pitch with investors via a single link. Professional, polished, ready to impress.",
              },
              {
                n: "04",
                title: "Iterative Refinement",
                desc: "Chat with AI to refine any slide or document. Highlight, comment, and watch changes apply in real-time.",
              },
            ].map((f) => (
              <div key={f.n} style={{ paddingRight: "clamp(8px, 2vw, 24px)" }}>
                <span className="text-[11px] font-mono text-accent block" style={{ marginBottom: "20px" }}>
                  {f.n}
                </span>
                <h3 className="text-[18px] font-bold leading-snug" style={{ marginBottom: "16px" }}>
                  {f.title}
                </h3>
                <p className="text-body-sm text-gray-300 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER — Black block ═══ */}
      <footer className="bg-black text-white">
        <div style={{ padding: "clamp(80px, 10vw, 160px) clamp(48px, 6vw, 120px) clamp(48px, 6vw, 96px)" }}>
          {/* Massive text */}
          <h2 className="text-display-lg font-black uppercase tracking-tight leading-[0.88]">
            LET&apos;S
            <br />
            BUILD.
          </h2>

          {/* CTA row */}
          <div style={{ marginTop: "clamp(40px, 5vw, 72px)" }}>
            <Link
              href="/signup"
              className="group inline-flex items-center border border-white/30 text-white font-bold uppercase tracking-[0.12em] hover:bg-white hover:text-black transition-colors"
              style={{ padding: "24px 48px", fontSize: "15px" }}
            >
              Get Started
              <span
                className="inline-block ml-6 transition-transform group-hover:translate-x-1"
                style={{ fontSize: "20px" }}
              >
                &rarr;
              </span>
            </Link>
          </div>

          {/* Footer meta row */}
          <div
            className="flex flex-col md:flex-row md:items-end md:justify-between pt-10 border-t border-white/20"
            style={{ marginTop: "clamp(80px, 10vw, 160px)" }}
          >
            <div>
              <Link
                href="mailto:hello@traction.ai"
                className="text-body font-medium underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
              >
                hello@traction.ai
              </Link>
            </div>

            <div
              className="mt-8 md:mt-0"
              style={{ display: "flex", gap: "clamp(24px, 3vw, 48px)" }}
            >
              <span className="swiss-label text-white/50 hover:text-white cursor-pointer transition-colors">
                Privacy
              </span>
              <span className="swiss-label text-white/50 hover:text-white cursor-pointer transition-colors">
                Terms
              </span>
              <span className="swiss-label text-white/50">
                &copy; 2026 Traction
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
