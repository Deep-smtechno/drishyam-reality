// Starts Next.js on every network interface and prints the address other devices can use.
// Usage: node scripts/serve.mjs dev|start
import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";
import { createRequire } from "node:module";
const mode = process.argv[2] === "start" ? "start" : "dev";
const port = process.env.PORT || "3000";
const addresses = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n.address);
console.log("\n  Drishyam Realty · " + (mode === "dev" ? "development" : "production") + " server");
console.log(`  Local:    http://localhost:${port}`);
for (const ip of addresses) console.log(`  Network:  http://${ip}:${port}`);
console.log(`  Admin:    http://localhost:${port}/admin`);
if (!addresses.length) console.log("  (No network connection found, so only this computer can open the site.)");
console.log("");
const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [next, mode, "--hostname", "0.0.0.0", "--port", port], {
  stdio: "inherit",
  env: process.env,
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
