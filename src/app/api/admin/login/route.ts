import { compare } from "bcryptjs";
import { z } from "zod";
import { executeProcedure, procedures, nv } from "@/lib/db";
import { databaseConfigured } from "@/lib/db-config";
import {
  sameOrigin,
  readBody,
  rateLimit,
  createSession,
  apiError,
  HttpError,
  type AdminUser,
} from "@/lib/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!databaseConfigured())
      throw new HttpError(
        503,
        "Administrator access requires a configured SQL Server database.",
      );
    await rateLimit(request, "login", 6);
    const parsed = z
      .object({
        email: z.string().email().max(200),
        password: z.string().min(1).max(200),
      })
      .safeParse(await readBody(request));
    if (!parsed.success)
      throw new HttpError(400, "Enter a valid email and password.");
    const result = await executeProcedure<AdminUser>(procedures.adminFind, {
      Email: nv(parsed.data.email.toLowerCase(), 200),
    });
    const user = result.recordset[0];
    const valid = await compare(
      parsed.data.password,
      user?.passwordHash ||
        "$2b$12$hIOKhUSvrklva14/WatOv.hRBQqx1AdTYGg1QTpeMVZeFlRYEcns6",
    );
    if (!user || !user.active || !valid)
      throw new HttpError(401, "The email or password is incorrect.");
    await createSession(user.id);
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
