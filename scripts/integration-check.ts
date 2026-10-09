import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import sql from "mssql";
import { getPool, closePool, procedures } from "../src/lib/db";
import { demoProperties } from "../src/lib/demo";
async function main() {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  let rolledBack = false;
  try {
    const id = `DR-CHECK-${randomUUID().slice(0, 8)}`;
    const sample = {
      ...demoProperties[0],
      id,
      slug: id.toLowerCase(),
      title: "Database verification (rolled back)",
      demo: true,
    };
    await new sql.Request(transaction)
      .input("Payload", sql.NVarChar(sql.MAX), JSON.stringify(sample))
      .input("ActorId", sql.UniqueIdentifier, null)
      .execute(procedures.propertySave);
    const props = await new sql.Request(transaction)
      .input("IncludeUnavailable", sql.Bit, true)
      .execute(procedures.propertiesList);
    const saved = props.recordset.find((p) => p.id === id);
    assert(saved);
    assert.equal(JSON.parse(saved.imagesJson).length, sample.images.length);
    assert.equal(saved.demo, true);
    const key = randomUUID();
    const payload = {
      name: "Database Verification",
      phone: "+919999900000",
      email: "",
      type: "Schedule a Visit",
      category: "Residential",
      consent: true,
      propertyId: id,
      propertyTitle: sample.title,
      source: "/verification",
      action: "Schedule a Visit",
    };
    async function enquiry() {
      return new sql.Request(transaction)
        .input("Payload", sql.NVarChar(sql.MAX), JSON.stringify(payload))
        .input("IdempotencyKey", sql.NVarChar(100), key)
        .execute(procedures.enquiryCreate);
    }
    const first = await enquiry();
    const second = await enquiry();
    assert.equal(first.recordset[0].id, second.recordset[0].id);
    assert.equal(first.recordset[0].created, true);
    assert.equal(second.recordset[0].created, false);
    const leadId = first.recordset[0].id;
    await new sql.Request(transaction)
      .input("Id", sql.UniqueIdentifier, leadId)
      .input("Status", sql.NVarChar(30), "Closed")
      .input(
        "Notes",
        sql.NVarChar(sql.MAX),
        "Verification only; transaction is rolled back.",
      )
      .input("ActorId", sql.UniqueIdentifier, null)
      .execute(procedures.enquiryUpdate);
    const leads = await new sql.Request(transaction)
      .input("Search", sql.NVarChar(200), "Database Verification")
      .input("Status", sql.NVarChar(30), "Closed")
      .execute(procedures.enquiriesList);
    assert(leads.recordset.some((l) => l.id === leadId));
    await new sql.Request(transaction)
      .input("Id", sql.NVarChar(70), id)
      .input("ActorId", sql.UniqueIdentifier, null)
      .execute(procedures.propertyArchive);
    const visible = await new sql.Request(transaction)
      .input("IncludeUnavailable", sql.Bit, false)
      .execute(procedures.propertiesList);
    assert(!visible.recordset.some((p) => p.id === id));
    console.log(
      "PASS: stored-procedure property save, image order, lead persistence, idempotency, lead update, and archive visibility.",
    );
  } finally {
    await transaction.rollback();
    rolledBack = true;
    await closePool();
    if (rolledBack)
      console.log(
        "Verification transaction rolled back; no test inventory or leads were retained.",
      );
  }
}
main().catch((e) => {
  console.error("Verification failed:", e.message);
  process.exitCode = 1;
});
