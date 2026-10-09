import { z } from "zod";
import { executeProcedure, procedures, json, uuid } from "@/lib/db";
import {
  sameOrigin,
  requireAdmin,
  readBody,
  apiError,
  HttpError,
} from "@/lib/security";
import { revalidatePath } from "next/cache";
export const runtime = "nodejs";
const schema = z
  .object({
    id: z.string().uuid().optional(),
    kind: z.enum(["category", "type"]),
    name: z.string().trim().min(2, "Enter a name of at least 2 characters."),
    active: z.boolean(),
  })
  .refine((v) => v.name.length <= (v.kind === "category" ? 30 : 50), {
    message: "That name is too long.",
    path: ["name"],
  });
function refresh() {
  revalidatePath("/", "layout");
}
export async function GET() {
  try {
    await requireAdmin();
    const result = await executeProcedure(procedures.mastersList);
    return Response.json(result.recordset, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin("ADMIN");
    const parsed = schema.safeParse(await readBody(request));
    if (!parsed.success)
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Check the name and try again.",
      );
    try {
      await executeProcedure(procedures.masterSave, {
        Payload: json(parsed.data),
        ActorId: uuid(user.id),
      });
    } catch (error) {
      const number = (error as { number?: number }).number;
      if (number === 2601 || number === 2627)
        throw new HttpError(409, "That name already exists.");
      throw error;
    }
    refresh();
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin("ADMIN");
    const body = await readBody(request);
    const id = z.string().uuid().safeParse(body?.id);
    if (!id.success) throw new HttpError(400, "Choose an entry to delete.");
    try {
      await executeProcedure(procedures.masterDelete, {
        Id: uuid(id.data),
        ActorId: uuid(user.id),
      });
    } catch (error) {
      if ((error as { number?: number }).number === 51011)
        throw new HttpError(
          409,
          "Properties still use this entry. Turn it off instead, or change those properties first.",
        );
      throw error;
    }
    refresh();
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
