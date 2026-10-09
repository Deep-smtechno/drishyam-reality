import "dotenv/config";
import {
  executeProcedure,
  procedures,
  json,
  nv,
  uuid,
  bit,
  closePool,
} from "../src/lib/db";
import { demoProperties, defaultSettings } from "../src/lib/demo";
async function main() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ALLOW_DEMO_SEED !== "true"
  )
    throw new Error(
      "Sample database seeding is disabled. Opt in with ALLOW_DEMO_SEED=true for a development database only.",
    );
  try {
    const existing = await executeProcedure<{ id: string }>(
      procedures.propertiesList,
      { IncludeUnavailable: bit(true) },
    );
    const ids = new Set(existing.recordset.map((p) => p.id));
    for (const p of demoProperties)
      if (!ids.has(p.id))
        await executeProcedure(procedures.propertySave, {
          Payload: json(p),
          ActorId: uuid(null),
        });
    const settings = await executeProcedure(procedures.settingsGet, {
      Key: nv("business", 100),
    });
    if (!settings.recordset.length)
      await executeProcedure(procedures.settingsSave, {
        Key: nv("business", 100),
        Value: json(defaultSettings),
        ActorId: uuid(null),
      });
    console.log(
      "Clearly marked sample properties added. Existing records and settings were preserved.",
    );
  } finally {
    await closePool();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
