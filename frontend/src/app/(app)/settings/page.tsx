"use client";

import { useAuth } from "@/contexts/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "clamp(32px, 4vw, 64px) clamp(32px, 4vw, 64px)" }}>
      {/* Header */}
      <div className="animate-fade-up">
        <p className="swiss-label text-gray-200" style={{ marginBottom: "12px" }}>
          Account
        </p>
        <h1 className="text-display font-black uppercase tracking-tight leading-none">
          Settings
        </h1>
        <p
          className="text-body-lg text-gray-300 max-w-[560px] leading-relaxed"
          style={{ marginTop: "16px" }}
        >
          Your account information.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[720px]">
        {/* Profile section */}
        <section className="animate-fade-up delay-1" style={{ marginTop: "clamp(40px, 5vw, 72px)" }}>
          <div className="flex items-center" style={{ gap: "16px", marginBottom: "clamp(24px, 3vw, 40px)" }}>
            <h2 className="swiss-label text-gray-300 flex-shrink-0">Profile</h2>
            <div className="flex-1 border-t hairline-dark" />
          </div>

          <div className="flex flex-col" style={{ gap: "clamp(24px, 3vw, 36px)" }}>
            <div>
              <p
                className="text-[12px] font-bold uppercase tracking-[0.14em] text-black"
                style={{ marginBottom: "12px" }}
              >
                Username
              </p>
              <p
                className="text-[17px] text-black border-b-2 border-gray-100"
                style={{ padding: "16px 0" }}
              >
                {user.username}
              </p>
            </div>

            <div>
              <p
                className="text-[12px] font-bold uppercase tracking-[0.14em] text-black"
                style={{ marginBottom: "12px" }}
              >
                Email
              </p>
              <p
                className="text-[17px] text-black border-b-2 border-gray-100"
                style={{ padding: "16px 0" }}
              >
                {user.email}
              </p>
            </div>

            <div>
              <p
                className="text-[12px] font-bold uppercase tracking-[0.14em] text-black"
                style={{ marginBottom: "12px" }}
              >
                Display Name
              </p>
              <p
                className="text-[17px] border-b-2 border-gray-100"
                style={{ padding: "16px 0" }}
              >
                {user.display_name || <span className="text-gray-200">Not set</span>}
              </p>
            </div>

            <div>
              <p
                className="text-[12px] font-bold uppercase tracking-[0.14em] text-black"
                style={{ marginBottom: "12px" }}
              >
                Member Since
              </p>
              <p
                className="text-[17px] text-black border-b-2 border-gray-100"
                style={{ padding: "16px 0" }}
              >
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t hairline flex items-center justify-between animate-fade-up delay-2 max-w-[720px]"
        style={{ marginTop: "clamp(48px, 6vw, 96px)", paddingTop: "20px" }}
      >
        <p className="text-[12px] text-gray-200">
          Account settings
        </p>
        <p className="text-[12px] text-gray-200 font-mono">
          TRACTION<span className="text-accent">.</span>
        </p>
      </div>
    </div>
  );
}
