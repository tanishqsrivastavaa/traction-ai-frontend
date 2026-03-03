"use client";

import { useAuth } from "@/contexts/auth-context";

function getInitials(user: { display_name: string | null; username: string }): string {
  const name = user.display_name || user.username;
  return name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export function AppHeader() {
  const { user, logout } = useAuth();
  const initials = getInitials(user);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between bg-white border-b hairline"
      style={{ height: "72px", padding: "0 clamp(24px, 3vw, 48px)" }}
    >
      {/* Mobile menu */}
      <button
        className="lg:hidden flex flex-col gap-[6px]"
        aria-label="Toggle menu"
      >
        <span className="block w-6 h-[1.5px] bg-black" />
        <span className="block w-6 h-[1.5px] bg-black" />
      </button>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* User indicator */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-gray-200 font-medium hidden sm:block">
          {user.display_name || user.username}
        </span>
        <div className="flex items-center justify-center w-9 h-9 bg-black text-white text-[11px] font-bold tracking-wide">
          {initials}
        </div>
        <button
          onClick={logout}
          className="text-[12px] text-gray-200 font-medium hover:text-black transition-colors uppercase tracking-[0.08em]"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
