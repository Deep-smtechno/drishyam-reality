import sql from "mssql";
import { sqlConfig } from "./db-config";
export const procedures = {
  health: "drishyam.usp_Health",
  mastersList: "drishyam.usp_Masters_List",
  masterSave: "drishyam.usp_Master_Save",
  masterDelete: "drishyam.usp_Master_Delete",
  propertiesList: "drishyam.usp_Properties_List",
  propertySave: "drishyam.usp_Property_Save",
  propertyArchive: "drishyam.usp_Property_Archive",
  propertySetActive: "drishyam.usp_Property_SetActive",
  settingsGet: "drishyam.usp_Settings_Get",
  settingsSave: "drishyam.usp_Settings_Save",
  testimonialsList: "drishyam.usp_Testimonials_List",
  testimonialSave: "drishyam.usp_Testimonial_Save",
  adminFind: "drishyam.usp_Admin_Find",
  adminCreate: "drishyam.usp_Admin_Create",
  sessionCreate: "drishyam.usp_Session_Create",
  sessionFind: "drishyam.usp_Session_Find",
  sessionDelete: "drishyam.usp_Session_Delete",
  rateLimit: "drishyam.usp_RateLimit_Increment",
  enquiryCreate: "drishyam.usp_Enquiry_Create",
  enquiriesList: "drishyam.usp_Enquiries_List",
  enquiryUpdate: "drishyam.usp_Enquiry_Update",
  enquiryDelete: "drishyam.usp_Enquiry_Delete",
  notificationClaim: "drishyam.usp_Notification_Claim",
  notificationUpdate: "drishyam.usp_Notification_Update",
} as const;
type Procedure = (typeof procedures)[keyof typeof procedures];
type Input = { type: sql.ISqlType | (() => sql.ISqlType); value: unknown };
const globalSql = globalThis as unknown as {
  drishyamPool?: Promise<sql.ConnectionPool>;
  drishyamRetryAt?: number;
};
export async function getPool() {
  if (globalSql.drishyamRetryAt && Date.now() < globalSql.drishyamRetryAt)
    throw new Error("SQL Server is temporarily unavailable.");
  if (!globalSql.drishyamPool) {
    const pool = new sql.ConnectionPool(sqlConfig());
    globalSql.drishyamPool = pool.connect().catch(async (error) => {
      globalSql.drishyamPool = undefined;
      globalSql.drishyamRetryAt = Date.now() + 15000;
      await pool.close().catch(() => {});
      throw error;
    });
  }
  return globalSql.drishyamPool;
}
/** Application data access is exclusively through parameterized stored procedures. */
export async function executeProcedure<T = Record<string, unknown>>(
  procedure: Procedure,
  inputs: Record<string, Input> = {},
) {
  const pool = await getPool();
  const request = pool.request();
  for (const [name, input] of Object.entries(inputs))
    request.input(name, input.type, input.value ?? null);
  return request.execute<T>(procedure);
}
export const nv = (value: unknown, length: number = sql.MAX): Input => ({
  type: sql.NVarChar(length > 4000 ? sql.MAX : length),
  value,
});
export const bit = (value: boolean): Input => ({ type: sql.Bit, value });
export const date = (value: Date): Input => ({ type: sql.DateTime2, value });
export const uuid = (value: string | null): Input => ({
  type: sql.UniqueIdentifier,
  value,
});
export const json = (value: unknown) => nv(JSON.stringify(value));
export async function closePool() {
  if (globalSql.drishyamPool) {
    const pool = await globalSql.drishyamPool;
    await pool.close();
    globalSql.drishyamPool = undefined;
  }
}
