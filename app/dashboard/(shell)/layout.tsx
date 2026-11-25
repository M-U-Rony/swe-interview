import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import DashboardShell from "./dashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect("/signin");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
