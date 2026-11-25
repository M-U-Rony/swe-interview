import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * First line of defence (D6 #32): no valid session token → no dashboard, no API.
 * This only checks the token's signature. Every page and route still checks the
 * session itself (including the sign-out version) and ownership of what it loads.
 */
export function proxy(request: NextRequest) {
  if (verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  // Everything under /dashboard and /api, except the routes used before signing in.
  matcher: ["/dashboard/:path*", "/api/((?!signin|signup|signout|me).*)"],
};
