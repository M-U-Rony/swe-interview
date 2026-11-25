/** Maximum resume length in characters, after cleaning (D4). */
export const MAX_RESUME_CHARS = 8000;

/**
 * Make resume text safe to place inside the interviewer prompt (D4):
 * drop control characters and anything that looks like a <resume> tag,
 * so the text cannot close the data block it is placed in.
 */
export function cleanResumeText(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<\s*\/?\s*resume[^>]*>/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SUSPICIOUS_PATTERNS: Array<[RegExp, string]> = [
  [/ignore (all |any )?(the )?(previous|prior|above|earlier) (instructions|prompts?|rules)/i, "ignore previous instructions"],
  [/disregard (all |any )?(the )?(previous|prior|above) /i, "disregard previous instructions"],
  [/system prompt/i, "system prompt"],
  [/you are now\b/i, "you are now"],
  [/\b(developer|admin|god) mode\b/i, "special mode"],
  [/(give|award|score) (me|this candidate|the candidate) (a )?(10|ten|full marks|perfect)/i, "asks for a score"],
  [/\bas an? (ai|language model|llm)\b/i, "talks to the AI"],
  [/<\s*\/?\s*(system|instructions?|prompt)\s*>/i, "instruction tags"],
];

/** Phrases in a resume that look like an attempt to instruct the AI (D4). */
export function findSuspiciousPhrases(text: string): string[] {
  return SUSPICIOUS_PATTERNS.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}
