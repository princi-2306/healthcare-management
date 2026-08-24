import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = (token?.role as string) || "";

    // Direct redirects for non-prefixed routes
    if (pathname === "/dashboard") {
      const target = role === "admin"
        ? "/admin/dashboard"
        : role === "doctor"
          ? "/doctor/dashboard"
          : "/patient/dashboard";
      const url = new URL(target, req.url);
      url.search = req.nextUrl.search;
      return NextResponse.redirect(url);
    }

    if (pathname === "/profile") {
      const target = role === "doctor" ? "/doctor/profile" : "/patient/profile";
      const url = new URL(target, req.url);
      url.search = req.nextUrl.search;
      return NextResponse.redirect(url);
    }

    if (pathname === "/doctors") {
      const target = role === "admin" ? "/admin/doctors" : "/patient/doctors";
      const url = new URL(target, req.url);
      url.search = req.nextUrl.search;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/appointments/")) {
      const id = pathname.split("/")[2];
      const target = role === "doctor"
        ? `/doctor/appointments/${id}`
        : `/patient/appointments/${id}`;
      const url = new URL(target, req.url);
      url.search = req.nextUrl.search;
      return NextResponse.redirect(url);
    }

    // Role-based route protection
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/doctor") && role !== "doctor") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/patient") && role !== "patient") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin-only API routes
    if (pathname.startsWith("/api/doctors") && req.method === "POST") {
      if (role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes — always allow
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // All other routes require a valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/doctors",
    "/doctors/:path*",
    "/appointments",
    "/appointments/:path*",
    "/profile",
    "/profile/:path*",
    "/patient/:path*",
    "/doctor/:path*",
    "/admin/:path*",
    "/api/doctors/:path*",
    "/api/appointments/:path*",
    "/api/slots/:path*",
    "/api/calendar/:path*",
  ],
};
