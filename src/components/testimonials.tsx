"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Star, MessagesSquare } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { EnquiryButton } from "./enquiry";
// Each card gets its own tilt, offset and colour from the brand palette.
const tilts = [-4, 2.5, -2, 4, -3, 2, -4];
const lifts = [8, -6, 4, -8, 6, -3, 3];
export function TestimonialSection({
  reviews,
  full = false,
  heading = "What our clients say",
}: {
  reviews: Testimonial[];
  full?: boolean;
  heading?: string;
}) {
  const [filter, setFilter] = useState("All");
  const filtered = reviews.filter((p) => filter === "All" || p.type === filter);
  if (full) {
    const [lead, ...rest] = filtered;
    return (
      <section className="reviews-page section">
        <div className="container">
          <div className="filter-tabs reviews-filter">
            {["All", "Buyers", "Sellers", "Investors"].map((x) => (
              <button
                className={x === filter ? "selected" : ""}
                key={x}
                onClick={() => setFilter(x)}
              >
                {x}
              </button>
            ))}
          </div>
          {lead ? (
            <>
              <figure className="review-lead">
                <blockquote>{lead.quote}</blockquote>
                <ReviewMeta review={lead} />
              </figure>
              {rest.length > 0 && (
                <div className="review-grid">
                  {rest.map((review) => (
                    <figure className="review-item" key={review.id}>
                      <blockquote>{review.quote}</blockquote>
                      <ReviewMeta review={review} />
                    </figure>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="testimonial-empty">
              <h3>No testimonials yet.</h3>
              <p>
                Client reviews will appear here once they’ve been approved for
                publication.
              </p>
              <EnquiryButton className="plain-link">
                Talk to us <ArrowUpRight size={15} />
              </EnquiryButton>
            </div>
          )}
        </div>
      </section>
    );
  }
  return (
    <section className="testimonials-section section">
      <div className="container">
        <div className="section-heading" data-reveal>
          <h2>{heading}</h2>
        </div>
      </div>
      {filtered.length ? (
        <ul
          className="tcards"
          aria-label="Client testimonials"
          style={{ "--n": Math.max(filtered.length, 2) } as React.CSSProperties}
        >
          {filtered.map((review, i) => (
            <li
              key={review.id}
              className="tcard"
              data-tone={i % 7}
              tabIndex={0}
              style={
                {
                  "--r": `${tilts[i % tilts.length]}deg`,
                  "--y": `${lifts[i % lifts.length]}px`,
                  zIndex: i + 1,
                } as React.CSSProperties
              }
            >
              <div className="tcard-top">
                {review.rating ? (
                  <div
                    className="tcard-stars"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: review.rating }, (_, n) => (
                      <Star key={n} fill="currentColor" size={13} />
                    ))}
                  </div>
                ) : (
                  <span />
                )}
                {review.demo && <span className="tcard-tag">Sample</span>}
              </div>
              <blockquote>{review.quote}</blockquote>
              <div className="tcard-author">
                {review.image && (
                  <Image
                    src={review.image}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                  />
                )}
                <div>
                  <strong>{review.name}</strong>
                  <small>
                    {review.type}
                    {review.location ? ` · ${review.location}` : ""}
                  </small>
                  {review.videoUrl && (
                    <a
                      href={review.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch video <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="container">
          <div className="testimonial-empty">
            <MessagesSquare size={31} strokeWidth={1.1} />
            <h3>No testimonials yet.</h3>
            <p>
              Client reviews will appear here once they’ve been approved for
              publication.
            </p>
            <EnquiryButton className="plain-link">
              Talk to us <ArrowUpRight size={15} />
            </EnquiryButton>
          </div>
        </div>
      )}
      {
        <div className="container">
          <Link href="/testimonials" className="plain-link testimonial-more">
            Read more reviews <ArrowRight size={15} />
          </Link>
        </div>
      }
    </section>
  );
}

function ReviewMeta({ review }: { review: Testimonial }) {
  return (
    <figcaption className="review-meta">
      {review.image && (
        <Image src={review.image} alt="" width={44} height={44} unoptimized />
      )}
      <div>
        <strong>{review.name}</strong>
        <span>
          {review.type}
          {review.location ? ` · ${review.location}` : ""}
          {review.demo ? " · Sample review" : ""}
        </span>
      </div>
      {review.rating ? (
        <span
          className="review-rating"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </span>
      ) : null}
      {review.videoUrl && (
        <a href={review.videoUrl} target="_blank" rel="noopener noreferrer">
          Watch video
        </a>
      )}
    </figcaption>
  );
}
