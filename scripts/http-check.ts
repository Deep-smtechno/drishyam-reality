import "dotenv/config";
import assert from "node:assert/strict";
const base =
  process.env.TEST_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://127.0.0.1:3000";
const origin =
  process.env.TEST_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || base;
async function main() {
  const pages = [
    "/",
    "/about",
    "/buy-properties?category=Commercial",
    "/sell-properties",
    "/property/the-courtyard-residence",
    "/testimonials",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/disclaimer",
    "/admin",
  ];
  for (const path of pages) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert(
      !html.includes("data-next-error"),
      `${path} contains a render error`,
    );
    console.log("PASS route:", path);
  }
  const missing = await fetch(base + "/property/no-such-property");
  const missingHtml = await missing.text();
  assert(
    missing.status === 404 ||
      (missing.status === 200 &&
        missingHtml.includes("noindex") &&
        missingHtml.includes("This page or property is no longer available.")),
  );
  const unauthorized = await fetch(base + "/api/admin/properties");
  assert.equal(unauthorized.status, 401);
  const badOrigin = await fetch(base + "/api/enquiries", {
    method: "POST",
    headers: {
      Origin: "https://untrusted.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(badOrigin.status, 403);
  const invalid = await fetch(base + "/api/enquiries", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", phone: "123", consent: false }),
  });
  assert.equal(invalid.status, 400);
  const login = await fetch(base + "/api/admin/login", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie") || "";
  assert(cookie.includes("HttpOnly"));
  assert(cookie.includes("SameSite=strict"));
  const cookieHeader = cookie.split(";")[0];
  for (const path of [
    "/api/admin/properties",
    "/api/admin/enquiries",
    "/api/admin/settings",
    "/api/admin/testimonials",
  ]) {
    const response = await fetch(base + path, {
      headers: { Cookie: cookieHeader },
    });
    assert.equal(response.status, 200, path);
    const data = await response.json();
    if (path === "/api/admin/properties") {
      assert(Array.isArray(data));
      assert(data.length >= 3);
      assert(Array.isArray(data[0].images));
      assert.equal(typeof data[0].images[0], "string");
    }
    console.log("PASS protected endpoint:", path);
  }
  const admin = await fetch(base + "/admin", {
    headers: { Cookie: cookieHeader },
  });
  assert((await admin.text()).includes("Your properties."));
  const logout = await fetch(base + "/api/admin/logout", {
    method: "POST",
    headers: { Cookie: cookieHeader, Origin: origin },
  });
  assert.equal(logout.status, 200);
  assert.equal(
    (
      await fetch(base + "/api/admin/properties", {
        headers: { Cookie: cookieHeader },
      })
    ).status,
    401,
  );
  console.log(
    "PASS security: authorization, origin protection, form validation, admin login, protected content, session revocation.",
  );
}
main().catch((e) => {
  console.error("HTTP verification failed:", e.message);
  process.exitCode = 1;
});
