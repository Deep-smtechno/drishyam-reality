import { z } from "zod";
import { executeProcedure, procedures, nv, uuid } from "@/lib/db";
import {
  requireAdmin,
  sameOrigin,
  readBody,
  apiError,
  HttpError,
} from "@/lib/security";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const status = url.searchParams.get("status") || "";
    const result = await executeProcedure<Record<string, unknown>>(
      procedures.enquiriesList,
      { Search: nv(q, 200), Status: nv(status, 30) },
    );
    const rows = result.recordset;
    if (url.searchParams.get("export") === "csv") {
      const quote = (v: unknown) =>
        '"' +
        String(v ?? "")
          .replace(/^[=+@-]/, "'$&")
          .replace(/"/g, '""') +
        '"';
      const cols = [
        "id",
        "name",
        "phone",
        "email",
        "type",
        "propertyTitle",
        "status",
        "message",
        "notes",
        "createdAt",
      ] as const;
      return new Response(
        [
          cols.join(","),
          ...rows.map((row) => cols.map((c) => quote(row[c])).join(",")),
        ].join("\r\n"),
        {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="drishyam-enquiries.csv"',
            "Cache-Control": "no-store",
          },
        },
      );
    }
    return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin();
    const parsed = z
      .object({
        id: z.string(),
        status: z.enum([
          "New",
          "Contacted",
          "Visit Scheduled",
          "Qualified",
          "Closed",
        ]),
        notes: z.string().max(5000),
      })
      .safeParse(await readBody(request));
    if (!parsed.success)
      throw new HttpError(400, "Check the lead status and notes.");
    await executeProcedure(procedures.enquiryUpdate, {
      Id: uuid(parsed.data.id),
      Status: nv(parsed.data.status, 30),
      Notes: nv(parsed.data.notes, 5000),
      ActorId: uuid(user.id),
    });
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireAdmin("ADMIN");
    const parsed = z
      .object({ id: z.string().uuid() })
      .safeParse(await readBody(request));
    if (!parsed.success)
      throw new HttpError(400, "Choose an enquiry to delete.");
    await executeProcedure(procedures.enquiryDelete, {
      Id: uuid(parsed.data.id),
      ActorId: uuid(user.id),
    });
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
