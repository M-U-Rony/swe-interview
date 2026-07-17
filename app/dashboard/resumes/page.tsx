import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/dbConnection";
import { Resume } from "@/models/model";
import ResumesClient from "./resumesClient";

const JWT_SECRET = process.env.JWT_SECRET || "interview-prep-ai-secret-default-key-98765";

interface UserSession {
  userId: string;
  email: string;
  username: string;
}

export default async function ResumesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/signin");
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    userId = decoded.userId;
  } catch (err) {
    redirect("/signin");
  }

  // Connect to database and retrieve user's resume fileName (if any)
  let initialFileName: string | null = null;
  try {
    await dbConnect();
    const userResume = await Resume.findOne({ author: userId });
    if (userResume) {
      initialFileName = userResume.fileName || null;
    }
  } catch (error) {
    console.error("Failed to fetch user resume from database:", error);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-12">
      
      {/* Page Header */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Manager</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-3xl">
          Upload your resume below to construct your custom profile. Our AI engine parses your technical background, credentials, and achievements to generate tailored practice interviews.
        </p>
      </section>

      {/* Render the Client-Side Interactive Form & Display Wrapper */}
      <ResumesClient initialFileName={initialFileName} />

    </div>
  );
}
