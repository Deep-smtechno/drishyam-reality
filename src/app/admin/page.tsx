import type { Metadata } from "next";
import "./admin.css";
import { databaseConfigured } from "@/lib/db-config";
import { currentAdmin } from "@/lib/security";
import { AdminLogin } from "@/components/admin-login";
import { AdminDashboard } from "@/components/admin-dashboard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administrator Workspace",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const user = await currentAdmin();
  return user ? (
    <AdminDashboard user={{ name: user.name, role: user.role }} />
  ) : (
    <AdminLogin configured={databaseConfigured()} />
  );
}
