import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/dbConnection";
import { Resume } from "@/models/model";
import InterviewStartClient from "./interviewStartClient";


interface UserSession {
  userId: string;
  email: string;
  username: string;
}

export default async function InterviewStartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/signin");
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserSession;
    userId = decoded.userId;
  } catch (err) {
    redirect("/signin");
  }

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
