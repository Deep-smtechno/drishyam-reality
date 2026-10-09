import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { executeProcedure, procedures, nv, uuid, date } from "./db";
import { databaseConfigured } from "./db-config";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : new URL(request.url).origin;
  // Accept the configured site origin, or any origin that is the very host the browser
  // is talking to (so the site also works over the local network).
  let sameHost = false;
  try {
    sameHost = !!origin && new URL(origin).host === request.headers.get("host");
  } catch {}
  if (!origin || (origin !== allowed && !sameHost))
    throw new HttpError(403, "This request is not permitted.");
}
export async function readBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 16384)
    throw new HttpError(413, "The request is too large.");
  const text = await request.text();
  if (text.length > 16384)
    throw new HttpError(413, "The request is too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Please send valid form data.");
  }
}
export function fingerprint(request: Request) {
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "local";
  return createHash("sha256").update(ip).digest("hex");
}
export async function rateLimit(request: Request, scope: string, limit = 8) {
  const key = `${scope}:${fingerprint(request)}:${Math.floor(Date.now() / 600000)}`;
  const result = await executeProcedure<{ count: number }>(
    procedures.rateLimit,
    { Key: nv(key, 200), ResetAt: date(new Date(Date.now() + 600000)) },
  );
  if (result.recordset[0].count > limit)
    throw new HttpError(
      429,
      "Too many attempts. Please try again in ten minutes.",
    );
}
export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
  passwordHash?: string;
};
export async function currentAdmin() {
  if (!databaseConfigured()) return null;
  const token = (await cookies()).get("drishyam_session")?.value;
  if (!token) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const result = await executeProcedure<AdminUser>(procedures.sessionFind, {
    TokenHash: nv(tokenHash, 64),
  });
  return result.recordset[0] || null;
}
export async function requireAdmin(role: "ADMIN" | "EDITOR" = "EDITOR") {
  const user = await currentAdmin();
  if (!user) throw new HttpError(401, "Please sign in to continue.");
  if (role === "ADMIN" && user.role !== "ADMIN")
    throw new HttpError(403, "Administrator access is required.");
  return user;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await executeProcedure(procedures.sessionCreate, {
    UserId: uuid(userId),
    TokenHash: nv(createHash("sha256").update(token).digest("hex"), 64),
    ExpiresAt: date(expiresAt),
  });
  (await cookies()).set("drishyam_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (process.env.NODE_ENV !== "production")
    console.error(
      "Service request failed:",
      error instanceof Error ? error.message : "Unknown service error",
    );
  const number = (error as { number?: number })?.number;
  if (number === 51009)
    return Response.json(
      {
        error:
          "This submission identifier has already been used. Please refresh.",
      },
      { status: 409 },
    );
  if (number === 51004)
    return Response.json(
      { error: "This property is no longer available." },
      { status: 400 },
    );
  if (number === 2601 || number === 2627)
    return Response.json(
      { error: "That property ID or URL slug is already in use." },
      { status: 409 },
    );
  return Response.json(
    {
      error:
        "The contact service is temporarily unavailable. Please try again shortly.",
    },
    { status: 503 },
  );
}
