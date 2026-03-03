"use client";

import { createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logout as apiLogout } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Redirect to login even if the logout API call fails
    }
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
