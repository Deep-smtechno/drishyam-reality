import "server-only";
import { cache } from "react";
import { defaultSettings, demoProperties } from "./demo";
import type { Property, Settings, Testimonial } from "./types";
import { defaultContent, mergeContent, type SiteContent } from "./content";
import { databaseConfigured } from "./db-config";
import { executeProcedure, procedures, bit, nv } from "./db";
export type PropertyRow = Omit<
  Property,
  "images" | "amenities" | "createdAt"
> & {
  imagesJson: string;
  amenitiesJson: string;
  landmarksJson: string;
  createdAt: Date;
};
export function propertyFromRow(row: PropertyRow): Property {
  const { imagesJson, amenitiesJson, landmarksJson, ...p } = row;
  return {
    ...p,
    price: Number(p.price),
    images: JSON.parse(imagesJson || "[]").map((x: { url: string }) => x.url),
    amenities: JSON.parse(amenitiesJson || "[]").map(
      (x: { name: string }) => x.name,
    ),
    landmarks: JSON.parse(landmarksJson || "[]"),
    createdAt: row.createdAt.toISOString(),
  };
}
export const getProperties = cache(async (): Promise<Property[]> => {
  if (!databaseConfigured())
    return process.env.DEMO_MODE === "false" ? [] : demoProperties;
  try {
    const result = await executeProcedure<PropertyRow>(
      procedures.propertiesList,
      { IncludeUnavailable: bit(false) },
    );
    return result.recordset.map(propertyFromRow);
  } catch (error) {
    if (process.env.DEMO_MODE === "true") return demoProperties;
    throw error;
  }
});
export const getSettings = cache(async (): Promise<Settings> => {
  if (!databaseConfigured()) return defaultSettings;
  try {
    const result = await executeProcedure<{ value: string }>(
      procedures.settingsGet,
      { Key: nv("business", 100) },
    );
    const row = result.recordset[0];
    return row
      ? { ...defaultSettings, ...JSON.parse(row.value) }
      : defaultSettings;
  } catch (error) {
    if (process.env.DEMO_MODE === "true") return defaultSettings;
    throw error;
  }
});
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  if (!databaseConfigured()) return [];
  try {
    const rows = await executeProcedure<Testimonial>(
      procedures.testimonialsList,
      { ApprovedOnly: bit(true) },
    );
    return rows.recordset.map((r) => ({
      ...r,
      demo: /^sample client/i.test(r.name),
    }));
  } catch (error) {
    if (process.env.DEMO_MODE === "true") return [];
    throw error;
  }
});

export type Master = {
  id: string;
  kind: "category" | "type";
  name: string;
  active: boolean;
  used: number;
};
const defaultCategories = ["Residential", "Commercial", "Land"];
/** Active category names, for the public enquiry form. */
export const getCategories = cache(async (): Promise<string[]> => {
  if (!databaseConfigured()) return defaultCategories;
  try {
    const rows = await executeProcedure<Master>(procedures.mastersList);
    const names = rows.recordset
      .filter((m) => m.kind === "category" && m.active)
      .map((m) => m.name);
    return names.length ? names : defaultCategories;
  } catch {
    return defaultCategories;
  }
});

/** Wording for the Home and About pages, editable in the admin panel. */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!databaseConfigured()) return defaultContent;
  try {
    const result = await executeProcedure<{ value: string }>(
      procedures.settingsGet,
      { Key: nv("content", 100) },
    );
    const row = result.recordset[0];
    return mergeContent(defaultContent, row ? JSON.parse(row.value) : {});
  } catch {
    return defaultContent;
  }
});
