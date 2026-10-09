import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { TestimonialSection } from "@/components/testimonials";
import { getTestimonials } from "@/lib/data";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Customer Experiences",
  description:
    "Approved customer experiences from Drishyam Realty buyers, sellers and investors.",
};
export default async function Testimonials() {
  const reviews = await getTestimonials();
  return (
    <>
      <PageHeading
        name="Testimonials"
        eyebrow="THE PEOPLE BEHIND THE POSSIBILITIES"
        title="Client testimonials"
        description="Experiences shared by people we’ve worked with. Every story is published with the client’s approval."
      />
      <TestimonialSection reviews={reviews} full />
    </>
  );
}
