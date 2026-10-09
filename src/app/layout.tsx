import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/layout";
import { EnquiryProvider } from "@/components/enquiry";
import { getSettings, getCategories } from "@/lib/data";
export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "Drishyam Realty | Making Your Visualization Real",
    template: "%s | Drishyam Realty",
  },
  description:
    "Professional residential and commercial property guidance since 2019. Discover your next property with Drishyam Realty.",
  icons: { icon: "/favicon.svg" },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ]);
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Drishyam Realty",
              foundingDate: "2019",
              slogan: "Making Your Visualization Real",
            }).replace(/</g, "\\u003c"),
          }}
        />
        <EnquiryProvider settings={settings} categories={categories}>
          <SiteChrome settings={settings}>{children}</SiteChrome>
        </EnquiryProvider>
      </body>
    </html>
  );
}
