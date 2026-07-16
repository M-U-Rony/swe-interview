import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import DashboardShell from "./dashboardShell";

const JWT_SECRET = process.env.JWT_SECRET || "interview-prep-ai-secret-default-key-98765";

export interface UserSession {
  userId: string;
  email: string;
  username: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/signin");
  }

  let user: UserSession;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    user = decoded as UserSession;
  } catch (err) {
    // If token is invalid or expired, redirect to signin
    redirect("/signin");
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
