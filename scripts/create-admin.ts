import "dotenv/config";
import { hash } from "bcryptjs";
import { executeProcedure, procedures, nv, closePool } from "../src/lib/db";
async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least eight characters).",
    );
  try {
    await executeProcedure(procedures.adminCreate, {
      Email: nv(email, 200),
      Name: nv(process.env.ADMIN_NAME || "Drishyam Administrator", 100),
      PasswordHash: nv(await hash(password, 12), 100),
    });
    console.log(
      "Administrator created using a hashed password. Existing credentials are not overwritten.",
    );
  } finally {
    await closePool();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
