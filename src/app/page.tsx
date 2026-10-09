import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  MessagesSquare,
  Compass,
  HeartHandshake,
} from "lucide-react";
import { getProperties, getContent } from "@/lib/data";
import { buildFilterOptions } from "@/lib/options";
import type { SiteContent } from "@/lib/content";
import {
  HeroSearch,
  FeaturedProperties,
  Process,
} from "@/components/home-interactive";
import { EnquiryButton } from "@/components/enquiry";
import { TestimonialSection } from "@/components/testimonials";
import { getTestimonials } from "@/lib/data";
export default async function Home() {
  const [properties, reviews, content] = await Promise.all([
    getProperties(),
    getTestimonials(),
    getContent(),
  ]);
  const c = content.home;
  return (
    <>
      <section className="hero2">
        <div className="hero2-frame">
          <Image
            src="/images/hero.jpg"
            alt="Original architectural visualization of a luxury villa with warm stone, a courtyard and reflecting pool"
            fill
            priority
            sizes="100vw"
            className="hero2-image"
          />
          <div className="hero2-shade" />
          <div className="hero2-content">
            <h1>
              <span>{c.hero.line1}</span>
              <span>{c.hero.line2}</span>
              <small>{c.hero.tagline}</small>
            </h1>
            <div className="hero2-side">
              <p>{c.hero.intro}</p>
              <div className="hero2-actions">
                <Link href="/buy-properties" className="hero2-btn solid">
                  {c.hero.primaryButton} <ArrowRight size={16} />
                </Link>
                <EnquiryButton
                  action="Sell Property"
                  className="hero2-btn ghost"
                >
                  {c.hero.secondaryButton}
                </EnquiryButton>
              </div>
            </div>
          </div>
          <div className="hero2-search">
            <HeroSearch
              options={{
                buy: buildFilterOptions(
                  properties.filter((p) => p.showOnBuy !== false),
                ),
                sell: buildFilterOptions(
                  properties.filter((p) => p.showOnSell !== false),
                ),
              }}
            />
          </div>
        </div>
      </section>
      <section id="discover" className="about2 section container">
        <div className="about2-media" data-reveal>
          <div className="about2-main">
            <Image
              src="/images/interior.jpg"
              alt="A bright contemporary home interior"
              fill
              sizes="(max-width: 900px) 90vw, 40vw"
            />
          </div>
          <div className="about2-inset">
            <Image
              src="/images/villa.jpg"
              alt="Contemporary residential architecture"
              fill
              sizes="(max-width: 900px) 50vw, 20vw"
            />
          </div>
          <div className="about2-badge">
            <span>Since</span>
            <strong>2019</strong>
          </div>
        </div>
        <div className="about2-copy" data-reveal>
          <span className="about2-label">{c.about.label}</span>
          <h2>{c.about.heading}</h2>
          <p>{c.about.paragraph1}</p>
          <p>{c.about.paragraph2}</p>
          <ul className="about2-points">
            {[ShieldCheck, MessagesSquare, Compass, HeartHandshake].map(
              (Icon, i) => (
                <li key={i}>
                  <span className="about2-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <strong>{c.about.points[i].title}</strong>
                    <span>{c.about.points[i].text}</span>
                  </div>
                </li>
              ),
            )}
          </ul>
          <Link href="/about" className="hero2-btn navy">
            {c.about.button} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="featured-section section" id="properties">
        <div className="container">
          <div className="section-heading heading-row" data-reveal>
            <h2>{c.featured.heading}</h2>
            <p>{c.featured.subheading}</p>
          </div>
          <FeaturedProperties
            properties={properties.filter((p) => p.featured)}
          />
        </div>
      </section>
      <section className="routes-section section container">
        <div className="routes-photo" data-reveal>
          <Image
            src="/images/office.jpg"
            alt="Modern commercial architecture"
            fill
            sizes="(max-width: 800px) 90vw, 45vw"
          />
        </div>
        <div className="routes-copy" data-reveal>
          <div>
            <h3>{c.routes.buyingTitle}</h3>
            <p>{c.routes.buyingText}</p>
            <Link href="/buy-properties" className="plain-link">
              {c.routes.buyingLink} <ArrowRight size={15} />
            </Link>
          </div>
          <div>
            <h3>{c.routes.sellingTitle}</h3>
            <p>{c.routes.sellingText}</p>
            <EnquiryButton action="Sell Property" className="plain-link">
              {c.routes.sellingLink} <ArrowRight size={15} />
            </EnquiryButton>
          </div>
        </div>
      </section>
      <Process
        heading={c.process.heading}
        buyer={c.process.buyer}
        seller={c.process.seller}
      />
      <TestimonialSection reviews={reviews} heading={c.testimonials.heading} />
      <FinalCTA content={c.cta} />
    </>
  );
}
export function FinalCTA({ content }: { content: SiteContent["home"]["cta"] }) {
  return (
    <section className="final-cta">
      <div className="container">
        <h2>{content.heading}</h2>
        <p>{content.text}</p>
        <div className="cta-buttons">
          <Link href="/buy-properties" className="button button-navy">
            {content.primaryButton}
          </Link>
          <EnquiryButton className="button button-outline">
            {content.secondaryButton}
          </EnquiryButton>
        </div>
      </div>
    </section>
  );
}
