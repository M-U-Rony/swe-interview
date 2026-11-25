import { cookies } from "next/headers";
import LandingPage from "@/components/landingPage";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function Home() {
  // Only decides where the main button points, so the signature check is enough.
  const signedIn = verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value) !== null;
  return <LandingPage signedIn={signedIn} />;
}
