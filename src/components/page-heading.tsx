import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
const images: Record<string, string> = {
  "Buy Properties": "/images/hero.jpg",
  "Sell Properties": "/images/office.jpg",
  "About Us": "/images/villa.jpg",
  Contact: "/images/interior.jpg",
  Testimonials: "/images/villa.jpg",
};
export function PageHeading({
  name,
  title,
  description,
  children,
}: {
  name: string;
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="phero">
      <div className="phero-frame">
        <Image
          src={images[name] || "/images/office.jpg"}
          alt=""
          fill
          priority
          sizes="100vw"
          className="phero-image"
        />
        <div className="phero-shade" />
        <div className="phero-content">
          <nav className="phero-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={13} />
            <span>{name}</span>
          </nav>
          <div className="phero-row">
            <div>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
