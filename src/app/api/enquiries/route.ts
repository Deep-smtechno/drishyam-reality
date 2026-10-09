import { enquirySchema } from "@/lib/validation";
import { executeProcedure, procedures, json, nv } from "@/lib/db";
import { databaseConfigured } from "@/lib/db-config";
import {
  sameOrigin,
  readBody,
  rateLimit,
  apiError,
  HttpError,
} from "@/lib/security";
import { notifyEnquiry } from "@/lib/notifications";
import { z } from "zod";
export const runtime = "nodejs";
const contextSchema = z.object({
  propertyId: z.string().max(100).optional(),
  propertyTitle: z.string().max(200).optional(),
  propertyCategory: z.string().max(100).optional(),
  propertyUrl: z.string().url().max(1000).optional(),
  source: z.string().startsWith("/").max(500),
  action: z.string().max(100),
});
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = await readBody(request);
    const parsed = enquirySchema.safeParse(input);
    const context = contextSchema.safeParse(input);
    if (!parsed.success || !context.success)
      throw new HttpError(400, "Please check your details and try again.");
    if (parsed.data.website)
      throw new HttpError(400, "This enquiry could not be submitted.");
    if (!databaseConfigured())
      throw new HttpError(
        503,
        "Enquiries are not enabled in this design preview. Please return once our contact service is connected.",
      );
    await rateLimit(request, "enquiry", 8);
    const key = request.headers.get("Idempotency-Key");
    if (!key || !/^[\w-]{16,100}$/.test(key))
      throw new HttpError(400, "Please refresh the page and try again.");
    const phone = parsed.data.phone.startsWith("+")
      ? parsed.data.phone.replace(/[\s()-]/g, "")
      : `+91${parsed.data.phone.replace(/[\s()-]/g, "")}`;
    const { website, ...fields } = parsed.data;
    const result = await executeProcedure<{
      id: string;
      name: string;
      type: string;
      propertyTitle: string | null;
      created: boolean;
    }>(procedures.enquiryCreate, {
      IdempotencyKey: nv(key, 100),
      Payload: json({ ...fields, ...context.data, phone }),
    });
    const row = result.recordset[0];
    if (row.created) await notifyEnquiry(row);
    return Response.json(
      { ok: true, id: row.id },
      { status: row.created ? 201 : 200 },
    );
  } catch (e) {
    return apiError(e);
  }
}
