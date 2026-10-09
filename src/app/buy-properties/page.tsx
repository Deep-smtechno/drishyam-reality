import type { Metadata } from "next";
import { Suspense } from "react";
import { getProperties } from "@/lib/data";
import { Listings } from "@/components/listings";
import { PageHeading } from "@/components/page-heading";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Buy Properties",
  description:
    "Explore residential, commercial and land opportunities. Filter by location, budget, property type and more.",
};
export default async function BuyProperties() {
  const properties = await getProperties();
  return (
    <>
      <PageHeading
        name="Buy Properties"
        eyebrow="FIND YOUR NEXT CHAPTER"
        title={
          <>
            A place for your <em>possibilities.</em>
          </>
        }
        description="Discover residential and commercial spaces that fit your vision. Find the right location, the right proportions, and the right opportunity."
      />
      <Suspense
        fallback={
          <div className="container section">
            <div className="skeleton" style={{ height: 500 }} />
          </div>
        }
      >
        <Listings
          properties={properties.filter((p) => p.showOnBuy !== false)}
        />
      </Suspense>
    </>
  );
}
