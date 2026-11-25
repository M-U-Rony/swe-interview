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
    <section className="flex flex-col gap-10 pt-16">
      <div className="flex flex-col gap-4">
        <h1 className="m-0 font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-[64px]">Profile</h1>
        <p className="m-0 max-w-2xl text-[17px] leading-normal text-soft">
          Your role and level decide which questions Marcus asks and what a good answer looks like.
        </p>
      </div>
      <ProfileClient initialProfile={initialProfile} />
    </section>
  );
}
