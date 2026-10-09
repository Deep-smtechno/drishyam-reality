import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { sqlConfig } from "../src/lib/db-config";
import { filterProperties, similarProperties } from "../src/lib/filters";
import { demoProperties } from "../src/lib/demo";
import { enquirySchema } from "../src/lib/validation";
import { procedures } from "../src/lib/db";
test("SQL Express named instance configuration honors supplied options", () => {
  const config = sqlConfig({
    DB_SERVER: "192.168.0.3\\SQLEXPRESS",
    DB_DATABASE: "test",
    DB_USERNAME: "test",
    DB_PASSWORD: "test",
    DB_ENCRYPT: "false",
    DB_TRUST_SERVER_CERTIFICATE: "true",
  });
  assert.equal(config.server, "192.168.0.3");
  assert.equal(config.options?.instanceName, "SQLEXPRESS");
  assert.equal(config.options?.encrypt, false);
  assert.equal(config.options?.trustServerCertificate, true);
});
test("fixed SQL Server port bypasses named instance discovery", () => {
  const config = sqlConfig({
    DB_SERVER: "192.168.0.3\\SQLEXPRESS",
    DB_PORT: "1433",
    DB_DATABASE: "test",
    DB_USERNAME: "test",
    DB_PASSWORD: "test",
  });
  assert.equal(config.port, 1433);
  assert.equal(config.options?.instanceName, undefined);
  assert.equal(config.options?.encrypt, true);
});
test("combined URL filters and ascending price return the right properties", () => {
  const filtered = filterProperties(
    demoProperties,
    new URLSearchParams({
      category: "Residential",
      beds: "3",
      max: "30000000",
      sort: "price-asc",
    }),
  );
  assert.deepEqual(
    filtered.map((p) => p.id),
    ["DR-DEMO-002", "DR-DEMO-001"],
  );
  assert.equal(
    filterProperties(demoProperties, new URLSearchParams({ min: "999999999" }))
      .length,
    0,
  );
});
test("similar properties exclude the current listing and prioritize a matching category", () => {
  const related = similarProperties(demoProperties[0], demoProperties);
  assert(!related.some((p) => p.id === demoProperties[0].id));
  assert.equal(related[0].category, "Residential");
});
test("enquiries require explicit consent and a valid phone", () => {
  const input = {
    name: "Test Visitor",
    phone: "9876543210",
    email: "",
    category: "Residential",
    type: "Buy Property",
    consent: true,
  };
  assert(enquirySchema.safeParse(input).success);
  assert(enquirySchema.safeParse({ ...input, phone: "+447700900123" }).success);
  assert(!enquirySchema.safeParse({ ...input, consent: false }).success);
  assert(!enquirySchema.safeParse({ ...input, phone: "123" }).success);
});
test("all registered application SPs exist and runtime source has no direct query calls", () => {
  const schema = readdirSync(resolve("database"))
    .filter((f) => f.endsWith(".sql"))
    .map((f) => readFileSync(resolve("database", f), "utf8"))
    .join("\n");
  for (const sp of Object.values(procedures))
    assert(schema.includes(`PROCEDURE ${sp} `), `Missing procedure ${sp}`);
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(ts|tsx)$/.test(file)) {
        const source = readFileSync(file, "utf8");
        assert(
          !/\.(query|batch|unsafe)\s*\(/.test(source),
          `Direct SQL call in ${file}`,
        );
        assert(
          !/PrismaClient|@prisma\//.test(source),
          `ORM residue in ${file}`,
        );
      }
    }
  }
  walk(resolve("src"));
});
test("location filter matches an area inside a longer address, and options come from the data", async () => {
  const { buildFilterOptions } = await import("../src/lib/options");
  const options = buildFilterOptions(demoProperties);
  const areas = options.location.map((o) => o.value);
  assert(areas.includes("Surat"));
  const area = areas.find((a) => a !== "Surat")!;
  const filtered = filterProperties(
    demoProperties,
    new URLSearchParams({ location: area }),
  );
  assert(filtered.length > 0);
  assert(
    filtered.every((p) =>
      p.location
        .split(",")
        .map((x) => x.trim())
        .includes(area),
    ),
  );
  assert.equal(
    filterProperties(demoProperties, new URLSearchParams({ location: "Surat" }))
      .length,
    demoProperties.length,
  );
  assert.equal(
    options.category.reduce((n, o) => n + o.count, 0),
    demoProperties.length,
  );
});
test("saved page wording overrides defaults but keeps the fixed shape", async () => {
  const { defaultContent, mergeContent } = await import("../src/lib/content");
  const merged = mergeContent(defaultContent, {
    home: {
      hero: { line1: "Find home", line2: "   ", unknown: "x" },
      about: { points: [{ title: "Fast" }] },
    },
    evil: { key: "value" },
  });
  assert.equal(merged.home.hero.line1, "Find home");
  assert.equal(merged.home.hero.line2, defaultContent.home.hero.line2);
  assert.equal(merged.home.about.points.length, 4);
  assert.equal(merged.home.about.points[0].title, "Fast");
  assert.equal(
    merged.home.about.points[0].text,
    defaultContent.home.about.points[0].text,
  );
  assert(!("evil" in merged));
  assert.equal(
    mergeContent(defaultContent, "nonsense").home.hero.intro,
    defaultContent.home.hero.intro,
  );
});
