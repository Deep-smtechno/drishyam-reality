import "server-only";
import { executeProcedure, procedures, nv, uuid } from "./db";
export async function notifyEnquiry(enquiry: {
  id: string;
  name: string;
  type: string;
  propertyTitle: string | null;
}) {
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.ADMIN_NOTIFICATION_EMAIL ||
    !process.env.NOTIFICATION_FROM
  )
    return;
  const claimed = await executeProcedure<{ claimed: boolean }>(
    procedures.notificationClaim,
    { Id: uuid(enquiry.id) },
  );
  if (!claimed.recordset[0]?.claimed) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFICATION_FROM,
        to: [process.env.ADMIN_NOTIFICATION_EMAIL],
        subject: `New ${enquiry.type} enquiry · Drishyam Realty`,
        text: `A new enquiry from ${enquiry.name} has been received${enquiry.propertyTitle ? ` for ${enquiry.propertyTitle}` : ""}. Sign in to your administrator dashboard to view it. Lead ID: ${enquiry.id}`,
      }),
      signal: AbortSignal.timeout(7000),
    });
    await executeProcedure(procedures.notificationUpdate, {
      Id: uuid(enquiry.id),
      Status: nv(res.ok ? "Sent" : "Failed", 20),
    });
  } catch {
    await executeProcedure(procedures.notificationUpdate, {
      Id: uuid(enquiry.id),
      Status: nv("Failed", 20),
    });
  }
}
