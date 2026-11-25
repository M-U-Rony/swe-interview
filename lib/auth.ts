import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "@/lib/env";
import { User } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface UserSession {
  userId: string;
  email: string;
  username: string;
}

interface TokenPayload extends UserSession {
  tokenVersion: number;
}

/** Sign a session token for a user. */
export function signSession(session: UserSession, tokenVersion: number): string {
  const payload: TokenPayload = { ...session, tokenVersion };
  return jwt.sign(payload, env().JWT_SECRET, { expiresIn: SESSION_MAX_AGE_SECONDS });
}

/** Check the token's signature and expiry only. Returns null if missing, expired or tampered with. */
export function verifySessionToken(token: string | undefined): TokenPayload | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env().JWT_SECRET) as TokenPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      tokenVersion: decoded.tokenVersion ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Authenticate the current request from its session cookie. Besides the
 * signature, the token must carry the user's current tokenVersion, so tokens
 * from before a sign-out stop working (D9 #31).
 * @returns The active user session, or null if unauthenticated.
 */
export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload || !mongoose.isValidObjectId(payload.userId)) return null;

  await dbConnect();
  const user = await User.findById(payload.userId).select("tokenVersion").lean<{ tokenVersion?: number }>();
  if (!user || (user.tokenVersion ?? 0) !== payload.tokenVersion) return null;

  return { userId: payload.userId, email: payload.email, username: payload.username };
}

/**
 * Authenticate the current request and return the active userId.
 * @returns The active user's ID, or null if unauthenticated.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getUserSession();
  return session?.userId ?? null;
}
