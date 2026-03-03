import Link from "next/link";

export default function ServicesPage() {
  const services = [
    {
      n: "01",
      title: "Pitch Deck Generation",
      desc: "From a single prompt, Traction generates a complete, presentation-ready pitch deck — with slide design, narrative flow, and data visualizations baked in.",
      details: ["Custom slide themes", "Narrative arc structuring", "Auto data visualization", "Export to PPTX / HTML"],
    },
    {
      n: "02",
      title: "Financial Modeling",
      desc: "Projections, unit economics, and scenario analysis generated from your business model description. Investor-ready spreadsheets in seconds.",
      details: ["Revenue projections", "Unit economics", "Scenario analysis", "Cap table modeling"],
    },
    {
      n: "03",
      title: "Market Research",
      desc: "Competitive landscape mapping, TAM/SAM/SOM analysis, and industry trend reports — synthesized and sourced automatically.",
      details: ["Competitive analysis", "TAM / SAM / SOM", "Industry trend reports", "Citation sourcing"],
    },
    {
      n: "04",
      title: "Investor Sharing",
      desc: "Share your complete pitch via a single link. Track engagement, see which slides investors spend time on, and follow up with data.",
      details: ["One-link sharing", "View analytics", "Slide-level tracking", "Engagement scoring"],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ═══ NAVIGATION ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b hairline-dark">
        <div className="flex items-center h-[72px] w-full">
          <div
            className="flex items-center h-full border-r hairline-dark flex-shrink-0"
            style={{ padding: "0 clamp(24px, 3vw, 56px)" }}
          >
            <Link href="/" className="text-[22px] font-black tracking-tight whitespace-nowrap">
              TRACTION<span className="text-accent">.</span>
            </Link>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center h-full">
            <div className="flex items-center h-full" style={{ gap: "clamp(48px, 6vw, 96px)" }}>
              <Link href="/work" className="swiss-label text-gray-300 hover:text-black transition-colors h-full flex items-center">
                Work
              </Link>
              <Link href="/services" className="swiss-label text-black h-full flex items-center">
                Services
              </Link>
              <Link href="/login" className="swiss-label text-gray-300 hover:text-black transition-colors h-full flex items-center">
                Log In
              </Link>
            </div>
          </div>
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
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        className="pt-[72px]"
        style={{ padding: "clamp(120px, 12vw, 200px) clamp(48px, 6vw, 120px) clamp(64px, 8vw, 128px)" }}
      >
        <p className="swiss-label text-gray-200 animate-fade-up" style={{ marginBottom: "32px" }}>
          What We Do
        </p>
        <h1 className="text-display font-black uppercase tracking-tight leading-[0.92] animate-fade-up delay-1">
          Everything your
          <br />
          pitch needs.
        </h1>
        <p
          className="text-body-lg text-gray-300 max-w-[560px] leading-relaxed animate-fade-up delay-2"
          style={{ marginTop: "clamp(24px, 3vw, 48px)" }}
        >
          Traction handles the entire pitch pipeline — from deck creation
          to financial modeling to investor-ready sharing. One prompt, full stack.
        </p>
      </section>

      {/* ═══ SERVICES LIST ═══ */}
      <section className="border-t hairline-dark">
        <div style={{ padding: "0 clamp(48px, 6vw, 120px)" }}>
          {services.map((s) => (
            <div
              key={s.n}
              className="border-b hairline grid grid-cols-1 lg:grid-cols-12"
              style={{ padding: "clamp(48px, 5vw, 80px) 0", gap: "clamp(24px, 3vw, 48px)" }}
            >
              {/* Number + Title */}
              <div className="lg:col-span-1 flex items-start">
                <span className="text-[11px] font-mono text-accent">{s.n}</span>
              </div>
              <div className="lg:col-span-4">
                <h3 className="text-heading-sm font-bold leading-tight">
                  {s.title}
                </h3>
              </div>

              {/* Description */}
              <div className="lg:col-span-4">
                <p className="text-body text-gray-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {/* Details list */}
              <div className="lg:col-span-3">
                <ul className="flex flex-col" style={{ gap: "12px" }}>
                  {s.details.map((d) => (
                    <li key={d} className="text-body-sm text-gray-300 flex items-center gap-3">
                      <span className="w-1 h-1 bg-accent flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-black text-white">
        <div style={{ padding: "clamp(64px, 8vw, 120px) clamp(48px, 6vw, 120px) clamp(48px, 6vw, 80px)" }}>
          <h2 className="text-display-lg font-black uppercase tracking-tight leading-[0.88]">
            Ready to
            <br />
            start?
          </h2>
          <div style={{ marginTop: "clamp(40px, 5vw, 64px)" }}>
            <Link
              href="/signup"
              className="group inline-flex items-center border border-white/30 text-white font-bold uppercase tracking-[0.12em] hover:bg-white hover:text-black transition-colors"
              style={{ padding: "24px 48px", fontSize: "15px" }}
            >
              Start Your Pitch
              <span className="inline-block ml-6 transition-transform group-hover:translate-x-1" style={{ fontSize: "20px" }}>
                &rarr;
              </span>
            </Link>
          </div>
          <div
            className="flex flex-col md:flex-row md:items-end md:justify-between pt-10 border-t border-white/20"
            style={{ marginTop: "clamp(64px, 8vw, 120px)" }}
          >
            <Link
              href="mailto:hello@traction.ai"
              className="text-body font-medium underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
            >
              hello@traction.ai
            </Link>
            <div className="mt-8 md:mt-0" style={{ display: "flex", gap: "clamp(24px, 3vw, 48px)" }}>
              <span className="swiss-label text-white/50">&copy; 2026 Traction</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
