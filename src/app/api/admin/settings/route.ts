import { z } from "zod";
import { executeProcedure, procedures, json, uuid, nv } from "@/lib/db";
import { getSettings } from "@/lib/data";
import {
  sameOrigin,
  requireAdmin,
  readBody,
  apiError,
  HttpError,
} from "@/lib/security";
import { revalidatePath } from "next/cache";
const phone = z
  .string()
  .refine(
    (x) => !x || /^\+?[1-9]\d{7,14}$/.test(x),
    "Use a number with country code and digits only.",
  );
const schema = z.object({
  phone,
  whatsapp: phone,
  email: z.union([z.literal(""), z.string().email()]),
  address: z.string().max(500),
  hours: z.string().max(200),
  areas: z.array(z.string().max(100)).max(100),
  rentalEnabled: z.boolean(),
  leadGating: z.boolean(),
  demo: z.boolean(),
});
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await getSettings());
  } catch (e) {
    return apiError(e);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin("ADMIN");
    const parsed = schema.safeParse(await readBody(request));
    if (!parsed.success)
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Check your contact details.",
      );
    await executeProcedure(procedures.settingsSave, {
      Key: nv("business", 100),
      Value: json(parsed.data),
      ActorId: uuid(user.id),
    });
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
