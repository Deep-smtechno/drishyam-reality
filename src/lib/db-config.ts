import type { config } from "mssql";
export function databaseConfigured() {
  return !!(
    process.env.DB_SERVER &&
    process.env.DB_DATABASE &&
    process.env.DB_USERNAME &&
    process.env.DB_PASSWORD
  );
}
export function sqlConfig(
  env: Record<string, string | undefined> = process.env,
): config {
  const [server, instanceName] = String(env.DB_SERVER || "").split(/\\+/);
  if (!server || !env.DB_DATABASE || !env.DB_USERNAME || !env.DB_PASSWORD)
    throw new Error("SQL Server connection settings are incomplete.");
  return {
    server,
    database: env.DB_DATABASE,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    ...(env.DB_PORT ? { port: Number(env.DB_PORT) } : {}),
    connectionTimeout: 7000,
    requestTimeout: 15000,
    pool: { min: 0, max: 10, idleTimeoutMillis: 30000 },
    options: {
      encrypt: env.DB_ENCRYPT?.toLowerCase() !== "false",
      trustServerCertificate:
        env.DB_TRUST_SERVER_CERTIFICATE?.toLowerCase() === "true",
      enableArithAbort: true,
      abortTransactionOnError: true,
      useUTC: true,
      appName: "Drishyam Realty",
      ...(instanceName && !env.DB_PORT ? { instanceName } : {}),
    },
  };
}
