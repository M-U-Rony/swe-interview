import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/dbConnection";
import { Profile } from "@/models/model";
import ProfileClient from "./profileClient";

const JWT_SECRET = process.env.JWT_SECRET || "interview-prep-ai-secret-default-key-98765";

interface UserSession {
  userId: string;
  email: string;
  username: string;
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/signin");
  }

  let userId: string;
  let username = "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    userId = decoded.userId;
    username = decoded.username;
  } catch (err) {
    redirect("/signin");
  }

  // Load user profile details on server load (if any)
  let initialProfile: any = null;
  try {
    await dbConnect();
    const userProfile = await Profile.findOne({ user: userId });
    if (userProfile) {
      initialProfile = {
        fullName: userProfile.fullName || "",
        targetRole: userProfile.targetRole || "",
        experienceLevel: userProfile.experienceLevel || "Mid",
        bio: userProfile.bio || "",
        profileImage: userProfile.profileImage || null,
      };
    } else {
      // Return defaults if none created
      initialProfile = {
        fullName: username,
        targetRole: "Software Engineer",
        experienceLevel: "Mid",
        bio: "",
        profileImage: null,
      };
    }
  } catch (error) {
    console.error("Failed to query profile on page load:", error);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
          Manage your professional details. This data helps the AI contextualize mock interview sessions to match your seniority and experience level.
        </p>
      </div>

      <ProfileClient initialProfile={initialProfile} />
    </div>
  );
}
