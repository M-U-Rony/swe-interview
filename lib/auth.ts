import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "interview-prep-ai-secret-default-key-98765";

interface UserSession {
  userId: string;
  email: string;
  username: string;
}

/**
 * Reusable helper to authenticate the user session from cookies
 * and return the active userId.
 * 
 * @returns {Promise<string | null>} The active user's ID, or null if unauthenticated.
 */
export async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

/**
 * Reusable helper to authenticate the user session and return the full session payload.
 * 
 * @returns {Promise<UserSession | null>} The active user session, or null if unauthenticated.
 */
export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch (error) {
    return null;
  }
}
