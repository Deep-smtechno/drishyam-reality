import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { HttpError } from "./security";

export const maxUploadBytes = 10 * 1024 * 1024;
export const uploadMime: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
export const uploadDir = () =>
  resolve(process.env.UPLOAD_DIR || resolve(process.cwd(), "uploads"));

export function s3Configured() {
  return !!(
    process.env.S3_BUCKET &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_PUBLIC_URL
  );
}

/** Identify the real image format from its leading bytes, not the client's claim. */
export function sniffImage(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "png";
  const ascii = (from: number, to: number) =>
    String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export async function saveLocalImage(file: File) {
  if (file.size > maxUploadBytes)
    throw new HttpError(400, "Upload a JPG, PNG or WebP image under 10 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext)
    throw new HttpError(400, "Upload a JPG, PNG or WebP image under 10 MB.");
  const name = `${randomUUID()}.${ext}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(resolve(uploadDir(), name), bytes);
  return `/uploads/${name}`;
}
