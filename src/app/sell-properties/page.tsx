import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getProperties } from "@/lib/data";
import { Listings } from "@/components/listings";
import { PageHeading } from "@/components/page-heading";
import { EnquiryButton } from "@/components/enquiry";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sell Properties",
  description:
    "Browse properties marketed for sale and receive professional assistance selling your property with Drishyam Realty.",
};
export default async function SellProperties() {
  const properties = await getProperties();
  return (
    <>
      <PageHeading
        name="Sell Properties"
        eyebrow="THE NEXT OPPORTUNITY STARTS HERE"
        title={
          <>
            Open the door to <em>what’s next.</em>
          </>
        }
        description="Browse spaces marketed for sale, or begin a conversation about presenting your own property to prospective buyers."
      />
      <div className="seller-banner container">
        <div>
          <span className="eyebrow">FOR PROPERTY OWNERS</span>
          <h2>Planning to sell your property?</h2>
          <p>
            A thoughtful presentation. Relevant buyers. Professional guidance at
            every step.
          </p>
        </div>
        <EnquiryButton action="Sell Property">
          Submit Property Enquiry <ArrowUpRight size={17} />
        </EnquiryButton>
      </div>
      <Suspense
        fallback={
          <div className="container section">
            <div className="skeleton" style={{ height: 500 }} />
          </div>
        }
      >
        <Listings
          properties={properties.filter((p) => p.showOnSell !== false)}
          sell
        />
      </Suspense>
    </>
  );
}
