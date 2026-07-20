import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/dbConnection";
import { Profile } from "@/models/model";
import DashboardShell from "./dashboardShell";

const JWT_SECRET = process.env.JWT_SECRET || "interview-prep-ai-secret-default-key-98765";

export interface UserSession {
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  profileImage?: string | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/signin");
  }

  let user: UserSession;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    user = decoded as UserSession;
  } catch (err) {
    redirect("/signin");
  }

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
