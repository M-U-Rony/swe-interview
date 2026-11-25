import "server-only";
import { RateLimit } from "@/models/model";
import dbConnect from "@/utils/dbConnection";

/** Current count for a key within its window (0 if none). */
export async function getCount(key: string): Promise<number> {
  await dbConnect();
  const doc = await RateLimit.findOne({ key, expiresAt: { $gt: new Date() } });
  return doc?.count ?? 0;
}

/** Add one to a key; the window starts at the first hit and lasts `windowMs`. */
export async function hit(key: string, windowMs: number): Promise<number> {
  await dbConnect();
  const now = new Date();
  // An expired counter may still exist until MongoDB's TTL sweep removes it.
  await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
  try {
    const doc = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowMs) } },
      { upsert: true, new: true }
    );
    return doc.count;
  } catch {
    // Two first hits raced on the unique key; the other one created it.
    const doc = await RateLimit.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { new: true });
    return doc?.count ?? 1;
  }
}

export async function reset(key: string): Promise<void> {
  await dbConnect();
  await RateLimit.deleteOne({ key });
}

/** Best-effort client IP. Locally there is no proxy header, so everyone shares one bucket. */
export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}
