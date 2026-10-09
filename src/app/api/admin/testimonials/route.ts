import { z } from "zod";
import { executeProcedure, procedures, bit, json, uuid } from "@/lib/db";
import {
  sameOrigin,
  requireAdmin,
  readBody,
  apiError,
  HttpError,
} from "@/lib/security";
import { revalidatePath } from "next/cache";
const url = z
  .union([
    z.literal(""),
    z
      .string()
      .url()
      .refine((v) => v.startsWith("https://")),
  ])
  .optional();
const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(100),
  type: z.enum(["Buyers", "Sellers", "Investors"]),
  quote: z.string().min(10).max(2000),
  location: z.string().max(200),
  rating: z.number().int().min(1).max(5).nullable(),
  image: url,
  videoUrl: url,
  approved: z.boolean(),
});
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(
      (
        await executeProcedure(procedures.testimonialsList, {
          ApprovedOnly: bit(false),
        })
      ).recordset,
    );
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
      throw new HttpError(400, "Please check the testimonial details.");
    await executeProcedure(procedures.testimonialSave, {
      Payload: json(parsed.data),
      ActorId: uuid(user.id),
    });
    revalidatePath("/");
    revalidatePath("/testimonials");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
