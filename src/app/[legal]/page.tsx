import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
const documents: Record<
  string,
  { name: string; intro: string; sections: { title: string; text: string }[] }
> = {
  "privacy-policy": {
    name: "Privacy Policy",
    intro: "How we handle the details you share with us.",
    sections: [
      {
        title: "Information you choose to share",
        text: "Enquiry forms collect your name, mobile number and consent to contact. You may also share your email, preferred contact time and property requirements. Property enquiries include the relevant property and the page from which you contacted us.",
      },
      {
        title: "How information is used",
        text: "Enquiry information is used to respond to your request, discuss relevant properties and manage your property journey. Access is restricted to authorized staff. We do not use enquiry information to publish customer endorsements without permission.",
      },
      {
        title: "Service providers and storage",
        text: "The website uses database, hosting and optional notification providers to operate its services. Contact details are stored in the enquiry system when connected. Notification emails identify the enquiry and direct authorized staff to the dashboard.",
      },
      {
        title: "Cookies and preferences",
        text: "An essential, secure session cookie is used for administrator sign-in. Property filters are held in the page URL so you can revisit and share your search. No advertising or analytics trackers are included in this initial implementation.",
      },
      {
        title: "Your requests",
        text: "You may ask the company to correct your enquiry details or stop contacting you through the official contact channel published on the Contact page. Business contact details, retention periods and the responsible privacy contact must be finalized before launch.",
      },
    ],
  },
  "terms-and-conditions": {
    name: "Terms & Conditions",
    intro: "A clear starting point for using this website.",
    sections: [
      {
        title: "Website information",
        text: "Property information is provided to help you explore opportunities and begin a conversation. Availability, pricing and specifications may change. A listing or enquiry does not constitute a completed transaction, reservation, offer acceptance or contractual commitment.",
      },
      {
        title: "Independent verification",
        text: "Visitors should independently verify property title, approvals, legal documentation, area measurements and other material details with appropriate professionals before proceeding. Professional property consultation is provided according to the scope agreed with the company.",
      },
      {
        title: "Appropriate use",
        text: "Use the site to browse property information and send legitimate enquiries. Do not attempt unauthorized access, interfere with the service or submit misleading information. Property publication is restricted to authorized administrators.",
      },
      {
        title: "Customer enquiries",
        text: "Submitting an enquiry allows the team to contact you about your stated requirements, subject to your consent. No brokerage fee or other payment is agreed solely by submitting a website form.",
      },
      {
        title: "Final business terms",
        text: "The company’s legal entity, registered address, service terms, fee arrangements and applicable dispute provisions must be confirmed before this draft is used as the final published policy.",
      },
    ],
  },
  disclaimer: {
    name: "Disclaimer",
    intro: "Understand the information before making a property decision.",
    sections: [
      {
        title: "Illustrative preview content",
        text: "Any listing marked “Sample listing” is demonstration inventory. Its images, name, location, price and specifications do not represent a property available for transaction through Drishyam Realty. Architectural visualizations illustrate the brand’s design direction.",
      },
      {
        title: "Property details",
        text: "Live property details should be checked for current accuracy and availability. Photography and visualizations may differ from the actual property. Area descriptions and measurements should be independently confirmed.",
      },
      {
        title: "Investment discussions",
        text: "Property values, rental outcomes and investment returns are not guaranteed. Discuss your circumstances and seek independent financial and legal advice before making a commitment.",
      },
      {
        title: "Third-party services",
        text: "Optional maps, video tours and WhatsApp links are operated by their respective providers. External links are supplied for convenience and remain subject to those providers’ policies.",
      },
    ],
  },
};
export function generateStaticParams() {
  return Object.keys(documents).map((legal) => ({ legal }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ legal: string }>;
}): Promise<Metadata> {
  const { legal } = await params;
  return { title: documents[legal]?.name || "Page Not Found" };
}
export default async function Legal({
  params,
}: {
  params: Promise<{ legal: string }>;
}) {
  const { legal } = await params;
  const doc = documents[legal];
  if (!doc) notFound();
  return (
    <>
      <PageHeading
        name={doc.name}
        eyebrow="CLARITY AT EVERY STEP"
        title={doc.name}
        description={doc.intro}
      />
      <div className="container">
        <article className="content-prose">
          <p className="demo-note">
            Draft website policy · Business-specific details must be finalized
            before public launch.
          </p>
          {doc.sections.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
