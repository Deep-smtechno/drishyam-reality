import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return [];
  const properties = await getProperties();
  return [
    "",
    "/about",
    "/buy-properties",
    "/sell-properties",
    "/testimonials",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/disclaimer",
    ...properties.filter((p) => !p.demo).map((p) => `/property/${p.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
