import type { Metadata } from "next";
import Image from "next/image";
import {
  ShieldCheck,
  Compass,
  MessagesSquare,
  House,
  Building2,
  ChartNoAxesCombined,
  ArrowUpRight,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { EnquiryButton } from "@/components/enquiry";
import { ArchitectureViewer } from "@/components/architecture-viewer";
import { getContent } from "@/lib/data";
export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover Drishyam Realty, a property brokerage and consultancy providing professional guidance since 2019.",
};
export default async function About() {
  const c = (await getContent()).about;
  return (
    <>
      <PageHeading
        name="About Us"
        eyebrow="A VISION BUILT ON TRUST"
        title={c.hero.title}
        description={c.hero.description}
      />
      <section className="about2 section container">
        <div className="about2-media">
          <div className="about2-main">
            <Image
              src="/images/hero.jpg"
              alt="Original architectural visualization of a warm stone residence"
              fill
              sizes="(max-width: 900px) 90vw, 40vw"
            />
          </div>
          <div className="about2-inset">
            <Image
              src="/images/interior.jpg"
              alt="A bright contemporary home interior"
              fill
              sizes="(max-width: 900px) 50vw, 20vw"
            />
          </div>
          <div className="about2-badge">
            <span>Since</span>
            <strong>2019</strong>
          </div>
        </div>
        <div className="about2-copy">
          <span className="about2-label">{c.story.label}</span>
          <h2>{c.story.heading}</h2>
          <p>{c.story.paragraph1}</p>
          <p>{c.story.paragraph2}</p>
          <p>{c.story.paragraph3}</p>
        </div>
      </section>
      <section className="values-section section">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow">{c.values.label}</span>
            <h2>{c.values.heading}</h2>
          </div>
          <div className="values-grid">
            {[ShieldCheck, MessagesSquare, Compass].map((Icon, i) => {
              const { title, text } = c.values.items[i];
              return (
                <article key={title} data-reveal>
                  <span className="tile-icon">
                    <Icon size={22} strokeWidth={1.7} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading centered">
          <span className="eyebrow">{c.services.label}</span>
          <h2>{c.services.heading}</h2>
        </div>
        <div className="expertise-grid">
          {[House, Building2, ChartNoAxesCombined].map((Icon, i) => {
            const { title, text } = c.services.items[i];
            return (
              <article key={title}>
                <span className="tile-icon">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <EnquiryButton className="plain-link">
                  Let’s discuss <ArrowUpRight size={15} />
                </EnquiryButton>
              </article>
            );
          })}
        </div>
      </section>
      <section className="vision-section section container">
        <div>
          <span className="eyebrow">{c.vision.label}</span>
          <h2>{c.vision.heading}</h2>
          <p>{c.vision.text}</p>
        </div>
        <ArchitectureViewer />
      </section>
    </>
  );
}
