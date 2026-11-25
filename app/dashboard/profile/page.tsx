import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import dbConnect from "@/utils/dbConnection";
import { Profile } from "@/models/model";
import ProfileClient from "./profileClient";

export default async function ProfilePage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/signin");
  }
  const { userId, username } = session;

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
