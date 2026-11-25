import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import dbConnect from "@/utils/dbConnection";
import { Profile, Resume } from "@/models/model";
import InterviewStartClient from "./interviewStartClient";


export default async function InterviewStartPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/signin");
  }
  const userId = session.userId;

  // D10: profile (role + level) and resume are both needed before an interview.
  await dbConnect();
  const [profile, hasResume] = await Promise.all([
    Profile.findOne({ user: userId }),
    Resume.exists({ author: userId }),
  ]);
  if (!profile?.targetRole || !profile?.experienceLevel) {
    redirect("/dashboard/profile");
  }
  if (!hasResume) {
    redirect("/dashboard/resumes");
  }

  return <InterviewStartClient />;
}
