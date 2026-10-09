import { executeProcedure, procedures, json, uuid, nv } from "@/lib/db";
import { getContent } from "@/lib/data";
import { defaultContent, mergeContent } from "@/lib/content";
import { sameOrigin, requireAdmin, apiError, HttpError } from "@/lib/security";
import { revalidatePath } from "next/cache";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await getContent(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin("ADMIN");
    const text = await request.text();
    if (text.length > 60000)
      throw new HttpError(413, "The content is too large.");
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new HttpError(400, "Please send valid content.");
    }
    // Only the known fields are kept, so nothing else can be stored.
    const clean = mergeContent(defaultContent, body);
    await executeProcedure(procedures.settingsSave, {
      Key: nv("content", 100),
      Value: json(clean),
      ActorId: uuid(user.id),
    });
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
