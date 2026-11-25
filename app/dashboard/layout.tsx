import { redirect } from "next/navigation";
import { getUserSession, type UserSession } from "@/lib/auth";
import dbConnect from "@/utils/dbConnection";
import { Profile } from "@/models/model";
import DashboardShell from "./dashboardShell";

export interface DashboardUser extends UserSession {
  fullName?: string;
  profileImage?: string | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect("/signin");
  }
  const user: DashboardUser = { ...session };

  // Fetch profile to display actual image and name in navbar/sidebar
  try {
    await dbConnect();
    const userProfile = await Profile.findOne({ user: user.userId });
    if (userProfile) {
      user.fullName = userProfile.fullName;
      user.profileImage = userProfile.profileImage;
    }
  } catch (error) {
    console.error("Failed to fetch layout profile details:", error);
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
