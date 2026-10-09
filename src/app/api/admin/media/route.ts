import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  requireAdmin,
  sameOrigin,
  readBody,
  apiError,
  HttpError,
} from "@/lib/security";
import { s3Configured, saveLocalImage } from "@/lib/uploads";
export const runtime = "nodejs";
const schema = z.object({
  type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024),
});
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    // Without cloud storage, photos are stored on this server and served from /uploads.
    if (!s3Configured()) {
      if (
        request.headers.get("content-type")?.startsWith("multipart/form-data")
      ) {
        const file = (await request.formData()).get("file");
        if (!(file instanceof File))
          throw new HttpError(400, "Choose an image to upload.");
        return Response.json({ url: await saveLocalImage(file) });
      }
      return Response.json({ local: true });
    }
    const parsed = schema.safeParse(await readBody(request));
    if (!parsed.success)
      throw new HttpError(400, "Upload a JPG, PNG or WebP image under 10 MB.");
    const client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    const key = `properties/${randomUUID()}.${{ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[parsed.data.type]}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: parsed.data.type,
      ContentLength: parsed.data.size,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 180 });
    return Response.json({
      uploadUrl,
      url: `${process.env.S3_PUBLIC_URL!.replace(/\/$/, "")}/${key}`,
    });
  } catch (e) {
    return apiError(e);
  }
}
