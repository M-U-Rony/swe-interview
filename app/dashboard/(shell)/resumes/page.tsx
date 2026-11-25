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
    <section className="flex flex-col gap-10 pt-16">
      <div className="flex flex-col gap-4">
        <h1 className="m-0 font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-[64px]">Resume</h1>
        <p className="m-0 max-w-2xl text-[17px] leading-normal text-soft">
          Marcus picks his questions from your resume. Uploading a new one replaces the old one.
        </p>
      </div>
      <ResumesClient initialFileName={initialFileName} />
    </section>
  );
}
