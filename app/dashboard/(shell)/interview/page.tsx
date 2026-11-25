import { redirect } from "next/navigation";

/** Interviews start from the dashboard; this old entry point just goes there. */
export default function InterviewPage() {
  redirect("/dashboard");
}
