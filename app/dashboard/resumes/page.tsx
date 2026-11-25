import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import dbConnect from "@/utils/dbConnection";
import { Resume } from "@/models/model";
import ResumesClient from "./resumesClient";

export default async function ResumesPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/signin");
  }
  const userId = session.userId;

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
