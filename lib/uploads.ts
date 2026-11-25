import path from "node:path";

/** Profile images: max size and the only types accepted (D8 #25). */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
/** Resume PDFs: max size and how many pages are read (D8 #27). */
export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_PAGES = 5;

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const IMAGE_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
} as const;
export type ImageExt = keyof typeof IMAGE_TYPES;

/** Identify an image by its first bytes, never by its name or claimed type. */
export function detectImageType(bytes: Uint8Array): ImageExt | null {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith([0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "webp"; // RIFF....WEBP
  return null;
}

export function isPdf(bytes: Uint8Array): boolean {
  return [0x25, 0x50, 0x44, 0x46, 0x2d].every((b, i) => bytes[i] === b); // "%PDF-"
}

export function imageContentType(ext: ImageExt): string {
  return IMAGE_TYPES[ext];
}

/** Stored image names are always `<userId>-<timestamp>.<ext>`, chosen by the server (D8 #26). */
const STORED_NAME = /^([a-f0-9]{24})-(\d{10,16})\.(png|jpg|webp)$/;

export function parseStoredImageName(name: string): { userId: string; ext: ImageExt } | null {
  const match = STORED_NAME.exec(name);
  return match ? { userId: match[1], ext: match[3] as ImageExt } : null;
}
