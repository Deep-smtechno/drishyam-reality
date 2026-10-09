import { z } from "zod";
import { executeProcedure, procedures, json, nv, uuid, bit } from "@/lib/db";
import { propertyFromRow, type PropertyRow } from "@/lib/data";
import {
  sameOrigin,
  requireAdmin,
  readBody,
  apiError,
  HttpError,
} from "@/lib/security";
import { revalidatePath } from "next/cache";
const asset = z
  .string()
  .refine(
    (x) =>
      x.startsWith("/images/") ||
      /^\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(x) ||
      /^https:\/\//.test(x),
    "Use an uploaded image or HTTPS URL.",
  );
const schema = z.object({
  id: z.string().regex(/^[A-Za-z0-9-]{3,70}$/),
  slug: z.string().regex(/^[a-z0-9-]{3,150}$/),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(8000),
  category: z.string().trim().min(1).max(30),
  type: z.string().trim().min(1).max(50),
  location: z.string().min(2).max(200),
  address: z.string().max(500).optional(),
  price: z.number().positive(),
  area: z.number().positive(),
  bedrooms: z.number().int().min(0).max(100),
  bathrooms: z.number().int().min(0).max(100),
  furnishing: z.enum(["Unfurnished", "Semi-furnished", "Furnished"]),
  possession: z.enum(["Ready to move", "Under construction", "Immediate"]),
  status: z.enum(["Available", "Sold", "Inactive", "Archived"]),
  condition: z.enum(["New", "Resale"]),
  featured: z.boolean(),
  demo: z.boolean(),
  showOnBuy: z.boolean().optional(),
  showOnSell: z.boolean().optional(),
  carpetArea: z.number().positive().optional(),
  plotArea: z.number().positive().optional(),
  balconies: z.number().int().min(0).optional(),
  parking: z.number().int().min(0).optional(),
  floor: z.string().max(100).optional(),
  facing: z.string().max(50).optional(),
  age: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  videoUrl: z
    .union([
      z.literal(""),
      z
        .string()
        .url()
        .refine((v) => v.startsWith("https://")),
    ])
    .optional(),
  documentation: z.string().max(3000).optional(),
  landmarks: z.array(z.string().max(200)).optional(),
  images: z.array(asset).min(1).max(30),
  amenities: z.array(z.string().min(1).max(100)).max(50),
});
export async function GET() {
  try {
    await requireAdmin();
    const result = await executeProcedure<PropertyRow>(
      procedures.propertiesList,
      { IncludeUnavailable: bit(true) },
    );
    return Response.json(result.recordset.map(propertyFromRow));
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin();
    const parsed = schema.safeParse(await readBody(request));
    if (!parsed.success)
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message || "Check your property details.",
      );
    const masters = await executeProcedure<{ kind: string; name: string }>(
      procedures.mastersList,
    );
    const known = (kind: string, value: string) =>
      masters.recordset.some(
        (m) => m.kind === kind && m.name.toLowerCase() === value.toLowerCase(),
      );
    if (!known("category", parsed.data.category))
      throw new HttpError(400, "Choose a category from the list.");
    if (!known("type", parsed.data.type))
      throw new HttpError(400, "Choose a property type from the list.");
    await executeProcedure(procedures.propertySave, {
      Payload: json(parsed.data),
      ActorId: uuid(user.id),
    });
    [
      "/",
      "/buy-properties",
      "/sell-properties",
      `/property/${parsed.data.slug}`,
    ].forEach((p) => revalidatePath(p));
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin("ADMIN");
    const { id } = await readBody(request);
    if (typeof id !== "string")
      throw new HttpError(400, "Property ID is required.");
    await executeProcedure(procedures.propertyArchive, {
      Id: nv(id, 70),
      ActorId: uuid(user.id),
    });
    revalidatePath("/");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
