import { Navbar } from "@/components/shared/navbar";
import { RoleGuard } from "@/components/shared/role-guard";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
