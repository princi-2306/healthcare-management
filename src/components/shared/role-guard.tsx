"use client";

import { useRole } from "@/hooks/use-role";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  allowedRoles: ("patient" | "doctor" | "admin")[];
  children: React.ReactNode;
  fallbackUrl?: string;
}

/**
 * Client-side role guard component.
 * Redirects users who don't have the required role.
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallbackUrl = "/login",
}: RoleGuardProps) {
  const { role, isAuthenticated, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl);
    }
    if (!isLoading && isAuthenticated && role && !allowedRoles.includes(role)) {
      const targetDashboard =
        role === "admin"
          ? "/admin/dashboard"
          : role === "doctor"
            ? "/doctor/dashboard"
            : "/patient/dashboard";
      router.push(targetDashboard);
    }
  }, [role, isAuthenticated, isLoading, allowedRoles, router, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!isAuthenticated || (role && !allowedRoles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}
