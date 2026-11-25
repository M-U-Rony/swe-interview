import "server-only";
import { z } from "zod";

const envSchema = z.object({
  MONGODB_URL: z.string().min(1, "MONGODB_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters (generate one with: openssl rand -base64 32)"),
  ELEVENLABS_API_KEY: z.string().min(1, "ELEVENLABS_API_KEY is required"),
  ELEVENLABS_AGENT_ID: z.string().min(1, "ELEVENLABS_AGENT_ID is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Validated server-side environment. Parsed on first use and cached.
 * `instrumentation.ts` calls this at server start so a bad config fails fast.
 */
export function env(): Env {
  if (cached) return cached;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${problems}`);
  }

  cached = result.data;
  return cached;
}
