"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center text-[13px] uppercase tracking-[0.08em] transition-colors",
        isActive
          ? "font-bold text-black bg-[#f5f5f5]"
          : "font-medium text-gray-200 hover:text-black hover:bg-[#fafafa]"
      )}
      style={{ padding: "12px 16px" }}
    >
      {isActive && (
        <span className="w-[3px] h-[14px] bg-accent flex-shrink-0" style={{ marginRight: "14px" }} />
      )}
      {label}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isDashboard = pathname === "/dashboard" || pathname === "/dashboard/shared";
  const isIdeation = pathname.includes("/ideation");

  return (
    <aside className="hidden lg:flex lg:flex-col w-[280px] h-screen border-r hairline bg-white flex-shrink-0">
      {/* Logo */}
      <div className="h-[72px] flex items-center border-b hairline" style={{ padding: "0 28px" }}>
        <Link href="/dashboard" className="text-[22px] font-black tracking-tight">
          TRACTION<span className="text-accent">.</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1" style={{ padding: "32px 20px 20px" }}>
        <div className="flex flex-col" style={{ gap: "2px" }}>
          <NavLink
            href="/dashboard"
            label="Dashboard"
            isActive={pathname === "/dashboard"}
          />
        </div>

        <div className="border-t hairline" style={{ margin: "20px 16px" }} />

        <div className="flex flex-col" style={{ gap: "2px" }}>
          <NavLink
            href="/dashboard/shared"
            label="Shared"
            isActive={pathname === "/dashboard/shared"}
          />
          <NavLink
            href="/settings"
            label="Settings"
            isActive={pathname === "/settings"}
          />
        </div>
      </nav>

      {/* User */}
      <div className="border-t hairline" style={{ padding: "20px 28px" }}>
        <p className="text-[14px] font-semibold text-black">
          {user.display_name || user.username}
        </p>
        <p className="text-[12px] text-gray-200" style={{ marginTop: "4px" }}>
          {user.email}
        </p>
      </div>
    </aside>
  );
}
