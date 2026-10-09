import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import sql from "mssql";
import { sqlConfig } from "../src/lib/db-config";
async function main() {
  const pool = new sql.ConnectionPool(sqlConfig());
  try {
    await pool.connect();
    const dir = new URL("../database/", import.meta.url);
    const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
    const source = (
      await Promise.all(files.map((f) => readFile(new URL(f, dir), "utf8")))
    ).join("\nGO\n");
    const batches = source
      .split(/^GO\s*$/im)
      .map((s) => s.trim())
      .filter(Boolean);
    for (let index = 0; index < batches.length; index++) {
      // Setup only: fixed, checked-in DDL is executed through SQL Server's system SP.
      await pool
        .request()
        .input("stmt", sql.NVarChar(sql.MAX), batches[index])
        .execute("sys.sp_executesql");
    }
    console.log(
      `Installed drishyam schema and stored procedures (${batches.length} setup batches).`,
    );
  } finally {
    await pool.close();
  }
}
main().catch((e) => {
  console.error("Database setup failed:", e.message);
  process.exitCode = 1;
});
