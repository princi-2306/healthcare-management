"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Home,
  Users,
  User,
  LogOut,
  Menu,
  Stethoscope,
  Bell,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

const patientLinks = [
  { href: "/patient/dashboard", label: "Dashboard", icon: Home },
  { href: "/patient/doctors", label: "Find Doctors", icon: Stethoscope },
  { href: "/patient/appointments", label: "Appointments", icon: Calendar },
  { href: "/patient/profile", label: "Profile", icon: User },
];

const doctorLinks = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: Home },
  { href: "/doctor/schedule", label: "Schedule", icon: Calendar },
  { href: "/doctor/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/doctors", label: "Manage Doctors", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export function Navbar() {
  const { user, role, isAuthenticated } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links =
    role === "admin"
      ? adminLinks
      : role === "doctor"
        ? doctorLinks
        : patientLinks;

  if (!isAuthenticated) {
    return (
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Stethoscope className="h-6 w-6 text-sky-600" />
            <span>HealthCare</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href={
              role === "admin"
                ? "/admin/dashboard"
                : role === "doctor"
                  ? "/doctor/dashboard"
                  : "/patient/dashboard"
            }
            className="flex items-center gap-2 font-bold text-lg"
          >
            <Stethoscope className="h-6 w-6 text-sky-600" />
            <span>HealthCare</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full focus:outline-hidden hover:opacity-85 transition-opacity">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sky-100 text-sky-700">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(
                    role === "admin"
                      ? "/admin/dashboard"
                      : role === "doctor"
                        ? "/doctor/profile"
                        : "/patient/profile"
                  )
                }
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
