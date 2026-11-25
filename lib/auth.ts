import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface UserSession {
  userId: string;
  email: string;
  username: string;
}

/** Sign a session token for a user. */
export function signSession(session: UserSession): string {
  return jwt.sign(session, env().JWT_SECRET, { expiresIn: SESSION_MAX_AGE_SECONDS });
}

/** Verify a session token. Returns null if missing, expired or tampered with. */
export function verifySession(token: string | undefined): UserSession | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env().JWT_SECRET) as UserSession;
    return { userId: decoded.userId, email: decoded.email, username: decoded.username };
  } catch {
    return null;
  }
}

/**
 * Authenticate the current request from its session cookie.
 * @returns The active user session, or null if unauthenticated.
 */
export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * Authenticate the current request and return the active userId.
 * @returns The active user's ID, or null if unauthenticated.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getUserSession();
  return session?.userId ?? null;
}
