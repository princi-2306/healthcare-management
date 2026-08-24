import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export interface RequireRoleSuccess {
  authorized: true;
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      image?: string;
    };
  };
}

export interface RequireRoleFailure {
  authorized: false;
  response: NextResponse;
}

export type RequireRoleResult = RequireRoleSuccess | RequireRoleFailure;

export async function requireRole(requiredRoles: string[]): Promise<RequireRoleResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (!requiredRoles.includes(session.user.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    session: session as any,
  };
}

export function hasRole(session: any, role: string) {
  return session?.user?.role === role;
}

export function isAdmin(session: any) {
  return hasRole(session, "admin");
}

export function isDoctor(session: any) {
  return hasRole(session, "doctor");
}

export function isPatient(session: any) {
  return hasRole(session, "patient");
}

export function isOwnerOrAdmin(session: any, resourceUserId: any) {
  return session?.user?.id === resourceUserId.toString() || isAdmin(session);
}
