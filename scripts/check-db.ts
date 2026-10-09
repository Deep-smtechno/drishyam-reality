import "dotenv/config";
import sql from "mssql";
import { sqlConfig } from "../src/lib/db-config";
async function main() {
  const pool = new sql.ConnectionPool(sqlConfig());
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("table_name", sql.NVarChar(384), "Properties")
      .input("table_owner", sql.NVarChar(384), "drishyam")
      .execute("sys.sp_tables");
    console.log("SQL Server connection succeeded.");
    console.log(
      "Application schema:",
      result.recordset.length
        ? "installed"
        : "not installed; run npm run db:migrate",
    );
  } finally {
    await pool.close();
  }
}
main().catch((e) => {
  console.error("SQL Server connection failed:", e.code || "ERROR", e.message);
  process.exitCode = 1;
});
