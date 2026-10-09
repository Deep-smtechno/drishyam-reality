import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/demo";
import type { Property } from "@/lib/types";
export function PropertyCard({ property: p }: { property: Property }) {
  return (
    <article className="property-card">
      <Link href={`/property/${p.slug}`} className="property-image">
        <Image
          src={p.images[0] || "/images/hero.jpg"}
          alt={`${p.title} ${p.demo ? "illustrative architecture" : "exterior"}`}
          fill
          unoptimized={p.images[0]?.startsWith("https://")}
          sizes="(max-width: 650px) 90vw, (max-width: 1000px) 45vw, 30vw"
        />
        {p.demo && <span className="property-flag">Sample listing</span>}
      </Link>
      <div className="property-info">
        <h3>
          <Link href={`/property/${p.slug}`}>{p.title}</Link>
        </h3>
        <p className="property-location">
          {p.location} · {p.category}
        </p>
        <p className="property-meta">
          <strong>{formatPrice(p.price)}</strong>
          <span>
            {p.bedrooms > 0 ? `${p.bedrooms} bed · ` : `${p.type} · `}
            {p.area.toLocaleString("en-IN")} sq.ft.
          </span>
        </p>
      </div>
    </article>
  );
}
