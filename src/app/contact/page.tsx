import type { Metadata } from "next";
import { MapPin, Mail, Phone, Clock, ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { EnquiryForm } from "@/components/enquiry";
import { getSettings } from "@/lib/data";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Connect with Drishyam Realty for buying, selling, property consultation and investment enquiries.",
};
export default async function Contact() {
  const s = await getSettings();
  return (
    <>
      <PageHeading
        name="Contact"
        eyebrow="LET’S START WITH A CONVERSATION"
        title={
          <>
            Your vision.
            <br />
            <em>Our undivided attention.</em>
          </>
        }
        description="A question, a requirement, or an idea for what comes next. We’re here to help you find your way forward."
      />
      <section className="contact-layout section container">
        <div className="contact-information">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2>Great possibilities start with hello.</h2>
          <p>
            Tell us what you’re looking for and we’ll help you take the next
            step.
          </p>
          {s.demo && (
            <p className="demo-note">
              Temporary business details · Update these in the administration
              settings before launch.
            </p>
          )}
          <div className="contact-item">
            <MapPin size={23} strokeWidth={1.3} />
            <div>
              <h3>Visit our office</h3>
              <p>{s.address}</p>
            </div>
          </div>
          {s.phone && (
            <div className="contact-item">
              <Phone size={23} strokeWidth={1.3} />
              <div>
                <h3>Call our team</h3>
                <a href={`tel:${s.phone}`}>{s.phone}</a>
              </div>
            </div>
          )}
          <div className="contact-item">
            <Mail size={23} strokeWidth={1.3} />
            <div>
              <h3>Write to us</h3>
              {s.demo ? (
                <p>{s.email}</p>
              ) : (
                <a href={`mailto:${s.email}`}>{s.email}</a>
              )}
            </div>
          </div>
          {s.hours && (
            <div className="contact-item">
              <Clock size={23} strokeWidth={1.3} />
              <div>
                <h3>Office hours</h3>
                <p>{s.hours}</p>
              </div>
            </div>
          )}
          <div className="contact-areas">
            <span className="eyebrow">AREAS WE SERVE</span>
            <p>
              {s.areas.join(" · ") ||
                "Please enquire about your preferred location."}
            </p>
          </div>
          {s.whatsapp && (
            <a
              className="text-link"
              href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Connect on WhatsApp <ArrowUpRight size={16} />
            </a>
          )}
        </div>
        <div className="contact-form-card">
          <span className="eyebrow">TELL US WHAT YOU HAVE IN MIND</span>
          <h3>Let’s make your next move.</h3>
          <EnquiryForm />
        </div>
      </section>
      {!s.demo && s.address && (
        <div className="container contact-map">
          <iframe
            title="Drishyam Realty office location"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
          />
        </div>
      )}
    </>
  );
}
