import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { getProperties, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/demo";
import { similarProperties } from "@/lib/filters";
import { Gallery } from "@/components/gallery";
import { EnquiryButton } from "@/components/enquiry";
import { PropertyCard } from "@/components/property-card";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProperties()).find((x) => x.slug === slug);
  return p
    ? {
        title: p.title,
        description: `${p.demo ? "Sample listing preview. " : ""}${p.type} in ${p.location}. ${p.area} sq.ft. Discover specifications and request information from Drishyam Realty.`,
        robots: p.demo ? { index: false, follow: false } : undefined,
        alternates: process.env.NEXT_PUBLIC_SITE_URL
          ? {
              canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/property/${p.slug}`,
            }
          : undefined,
      }
    : { title: "Property not found" };
}
export default async function PropertyDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [properties, settings] = await Promise.all([
    getProperties(),
    getSettings(),
  ]);
  const p = properties.find((x) => x.slug === slug);
  if (!p) notFound();
  const similar = similarProperties(p, properties);
  return (
    <div className="container property-detail">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={11} />
        <Link href="/buy-properties">Properties</Link>
        <ChevronRight size={11} />
        <span>{p.title}</span>
      </div>
      <div className="detail-title">
        <div>
          <span className="eyebrow">
            {p.category.toUpperCase()} · {p.type.toUpperCase()}
          </span>
          <h1>{p.title}</h1>
          <p>
            <MapPin size={15} />
            {p.location}
            <span>Property ID: {p.id}</span>
          </p>
        </div>
        <div className="detail-price">
          {formatPrice(p.price)}
          <span>{p.demo ? "Illustrative asking price" : "Asking price"}</span>
        </div>
      </div>
      {p.demo && (
        <p className="demo-note detail-demo">
          Sample property · Images, price, location and specifications
          illustrate the experience. This is not available inventory.
        </p>
      )}
      <Gallery images={p.images} title={p.title} />
      <div className="detail-layout">
        <div>
          <div className="detail-highlights">
            {p.bedrooms > 0 && (
              <div>
                <BedDouble size={23} />
                <strong>{p.bedrooms} Bedrooms</strong>
                <small>Room to make your own</small>
              </div>
            )}
            {p.bathrooms > 0 && (
              <div>
                <Bath size={23} />
                <strong>{p.bathrooms} Bathrooms</strong>
                <small>Thoughtfully planned</small>
              </div>
            )}
            <div>
              <Maximize size={23} />
              <strong>{p.area.toLocaleString()} sq.ft.</strong>
              <small>Built-up area</small>
            </div>
            <div>
              <Calendar size={23} />
              <strong>{p.possession}</strong>
              <small>Possession status</small>
            </div>
          </div>
          <section className="detail-section">
            <span className="eyebrow">A CLOSER LOOK</span>
            <h2>
              A space to picture
              <br />
              <em>your life in.</em>
            </h2>
            <p>{p.description}</p>
          </section>
          <section className="detail-section">
            <h2>The details that matter.</h2>
            <dl className="property-facts">
              {Object.entries({
                "Property category": p.category,
                "Property type": p.type,
                "Built-up area": `${p.area.toLocaleString()} sq.ft.`,
                "Carpet area": p.carpetArea
                  ? `${p.carpetArea.toLocaleString()} sq.ft.`
                  : undefined,
                "Plot area": p.plotArea
                  ? `${p.plotArea.toLocaleString()} sq.ft.`
                  : undefined,
                Furnishing: p.furnishing,
                Bedrooms: p.bedrooms || undefined,
                Bathrooms: p.bathrooms || undefined,
                Balconies: p.balconies,
                "Parking spaces": p.parking,
                Floor: p.floor,
                Facing: p.facing,
                "Property age": p.age,
                Possession: p.possession,
                Condition: p.condition,
                Availability: p.status,
              })
                .filter(([, v]) => v !== undefined)
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
          </section>
          <section className="detail-section">
            <h2>Designed for everyday ease.</h2>
            <div className="amenity-grid">
              {p.amenities.map((x) => (
                <span key={x}>
                  <Check size={16} />
                  {x}
                </span>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h2>Your neighbourhood.</h2>
            <p>{p.address || p.location}</p>
            {p.latitude && p.longitude ? (
              <iframe
                className="location-map"
                title={`${p.title} location`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed`}
              />
            ) : (
              <div className="map-empty">
                <MapPin size={25} />
                <span>Exact location will be shared by our team.</span>
              </div>
            )}
            {p.landmarks && p.landmarks.length > 0 && (
              <ul>
                {p.landmarks.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            {p.documentation && <p>{p.documentation}</p>}
            <p className="small-note">
              Property documentation and transaction details are available on
              request. Please verify all information independently before making
              a commitment.
            </p>
            {p.videoUrl && (
              <a
                className="text-link"
                href={p.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Video Tour <ArrowUpRight size={16} />
              </a>
            )}
          </section>
        </div>
        <aside className="detail-enquiry">
          <span className="eyebrow">LET’S TAKE THE NEXT STEP</span>
          <h3>
            See the space.
            <br />
            <em>Feel the possibility.</em>
          </h3>
          <p>Let our team help you explore this property with confidence.</p>
          <EnquiryButton action="Schedule a Visit" property={p}>
            <Calendar size={16} />
            Schedule a Visit
          </EnquiryButton>
          <EnquiryButton
            action="Request Details"
            property={p}
            className="button button-outline"
          >
            Request Details <ArrowUpRight size={16} />
          </EnquiryButton>
          {settings.whatsapp && (
            <a
              className="text-link"
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello Drishyam Realty, I am interested in ${p.title}, Property ID: ${p.id}. Please share more details.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enquire on WhatsApp
            </a>
          )}
          <span className="enquiry-assurance">
            <ShieldCheck size={16} />
            Personal guidance. Transparent communication.
          </span>
        </aside>
      </div>
      {similar.length > 0 && (
        <section className="similar-section">
          <div className="section-heading heading-row">
            <div>
              <span className="eyebrow">MORE POSSIBILITIES TO EXPLORE</span>
              <h2>
                You might also <em>love.</em>
              </h2>
            </div>
            <Link href="/buy-properties" className="text-link">
              View More Properties <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="property-grid">
            {similar.map((x) => (
              <PropertyCard property={x} key={x.id} />
            ))}
          </div>
        </section>
      )}
      <div className="mobile-enquiry-bar">
        <span>{formatPrice(p.price)}</span>
        <EnquiryButton action="Schedule a Visit" property={p}>
          Schedule a Visit
        </EnquiryButton>
      </div>
    </div>
  );
}
