import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { executeProcedure, procedures, nv } from "@/lib/db";
import { databaseConfigured } from "@/lib/db-config";
import { sameOrigin, apiError } from "@/lib/security";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const jar = await cookies();
    const token = jar.get("drishyam_session")?.value;
    if (token && databaseConfigured())
      await executeProcedure(procedures.sessionDelete, {
        TokenHash: nv(createHash("sha256").update(token).digest("hex"), 64),
      });
    jar.delete("drishyam_session");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
