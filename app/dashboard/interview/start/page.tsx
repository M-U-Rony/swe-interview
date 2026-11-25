import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import dbConnect from "@/utils/dbConnection";
import { Resume } from "@/models/model";
import InterviewStartClient from "./interviewStartClient";


export default async function InterviewStartPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/signin");
  }
  const userId = session.userId;

  let resumeText = "";
  try {
    await dbConnect();
    const userResume = await Resume.findOne({ author: userId });
    if (userResume) {
      resumeText = userResume.rawText;
    } else {
      redirect("/dashboard/resumes");
    }
  } catch (error) {
    console.error("Failed to query resume text:", error);
    redirect("/dashboard/interview");
  }

  return (
    <InterviewStartClient resumeText={resumeText} />
  );
}
