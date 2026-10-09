"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Building2, Wallet, ArrowRight } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { PropertyCard } from "./property-card";
import { EnquiryButton } from "./enquiry";
import type { Property } from "@/lib/types";
import type { FilterOptions } from "@/lib/options";
export function HeroSearch({
  options,
}: {
  options: { buy: FilterOptions; sell: FilterOptions };
}) {
  const router = useRouter();
  const [tab, setTab] = useState("buy");
  const o = tab === "sell" ? options.sell : options.buy;
  return (
    <div className="search-panel">
      <Tabs.Root value={tab} onValueChange={setTab}>
        <div className="search-panel-top">
          <Tabs.List className="search-tabs" aria-label="Property purpose">
            <Tabs.Trigger value="buy">Buy</Tabs.Trigger>
            <Tabs.Trigger value="sell">Sell</Tabs.Trigger>
          </Tabs.List>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const qs = new URLSearchParams();
            for (const [k, v] of data.entries()) if (v) qs.set(k, String(v));
            router.push(`/${tab === "sell" ? "sell" : "buy"}-properties?${qs}`);
          }}
          className="search-fields"
        >
          <label>
            <span>
              <MapPin size={15} />
              Location
            </span>
            <select name="location" defaultValue="">
              <option value="">Any location</option>
              {o.location.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              <Building2 size={15} />
              Category
            </span>
            <select name="category" defaultValue="">
              <option value="">All categories</option>
              {o.category.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              <Building2 size={15} />
              Property type
            </span>
            <select name="type" defaultValue="">
              <option value="">All property types</option>
              {o.type.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              <Wallet size={15} />
              Budget
            </span>
            <select name="max" defaultValue="">
              <option value="">Any budget</option>
              {o.budget.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-navy">Search properties</button>
        </form>
      </Tabs.Root>
    </div>
  );
}
export function FeaturedProperties({ properties }: { properties: Property[] }) {
  const [filter, setFilter] = useState("All");
  const filtered = properties
    .filter(
      (p) =>
        filter === "All" ||
        p.category === filter ||
        (filter === "New Projects" && p.condition === "New") ||
        (filter === "Resale" && p.condition === "Resale"),
    )
    .slice(0, 3);
  return (
    <>
      <div className="property-section-bar">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Filter featured properties"
        >
          {[
            "All",
            "Residential",
            "Commercial",
            "Land",
            "New Projects",
            "Resale",
          ].map((x) => (
            <button
              key={x}
              aria-pressed={filter === x}
              onClick={() => setFilter(x)}
              className={filter === x ? "selected" : ""}
            >
              {x}
            </button>
          ))}
        </div>
        <Link href="/buy-properties" className="plain-link">
          View all properties <ArrowRight size={15} />
        </Link>
      </div>
      {properties.some((x) => x.demo) && (
        <p className="demo-note">
          These are sample listings with illustrative prices and locations.
        </p>
      )}
      <div className="property-grid">
        {filtered.length ? (
          filtered.map((p) => <PropertyCard key={p.id} property={p} />)
        ) : (
          <div className="empty-state">
            <Building2 />
            <h3>Nothing listed here right now.</h3>
            <p>
              Tell us what you’re looking for and we’ll let you know when
              something suitable comes up.
            </p>
            <EnquiryButton>Share your requirements</EnquiryButton>
          </div>
        )}
      </div>
    </>
  );
}
export function Process({
  heading,
  buyer,
  seller,
}: {
  heading: string;
  buyer: { title: string; text: string }[];
  seller: { title: string; text: string }[];
}) {
  const steps = { buyer, seller };
  const [tab, setTab] = useState<"buyer" | "seller">("buyer");
  return (
    <section className="process-section section container">
      <Tabs.Root
        value={tab}
        onValueChange={(v) => setTab(v as "buyer" | "seller")}
      >
        <div className="process-head" data-reveal>
          <h2>{heading}</h2>
          <Tabs.List className="process-tabs" aria-label="Property journey">
            <Tabs.Trigger value="buyer">Buying</Tabs.Trigger>
            <Tabs.Trigger value="seller">Selling</Tabs.Trigger>
          </Tabs.List>
        </div>
        <ol className="process-steps">
          {steps[tab].map(({ title, text }) => (
            <li className="process-step" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </Tabs.Root>
    </section>
  );
}
