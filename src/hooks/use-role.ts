"use client";

import { useSession } from "next-auth/react";

/**
 * Hook to get the current user's role from the session.
 */
export function useRole() {
  const { data: session, status } = useSession();

  return {
    role: session?.user?.role || null,
    isPatient: session?.user?.role === "patient",
    isDoctor: session?.user?.role === "doctor",
    isAdmin: session?.user?.role === "admin",
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user || null,
  };
}
