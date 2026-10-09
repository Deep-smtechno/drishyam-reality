"use client";
import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  SlidersHorizontal,
  Grid2X2,
  List,
  X,
  RotateCcw,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import { PropertyCard } from "./property-card";
import { EnquiryButton } from "./enquiry";
import { filterProperties } from "@/lib/filters";
import { buildFilterOptions } from "@/lib/options";
import type { Property } from "@/lib/types";
export function Listings({
  properties,
  sell = false,
}: {
  properties: Property[];
  sell?: boolean;
}) {
  const search = useSearchParams();
  const path = usePathname();
  const params = new URLSearchParams(search.toString());
  const [view, setView] = useState("grid");
  const [drawer, setDrawer] = useState(false);
  const [limit, setLimit] = useState(6);
  const items = filterProperties(properties, params);
  function update(key: string, value: string) {
    const qs = new URLSearchParams(search.toString());
    if (value) qs.set(key, value);
    else qs.delete(key);
    window.history.replaceState(null, "", `${path}${qs.size ? "?" + qs : ""}`);
    setLimit(6);
  }
  function clear() {
    window.history.replaceState(null, "", path);
    setLimit(6);
  }
  const active = [...params.entries()].filter(([k]) => k !== "sort");
  const options = buildFilterOptions(properties);
  const fields = [
    ["location", "Location", options.location],
    ["category", "Category", options.category],
    ["type", "Property type", options.type],
    ["condition", "New or resale", options.condition],
    ["beds", "Bedrooms", options.beds],
    ["furnishing", "Furnishing", options.furnishing],
    ["possession", "Possession", options.possession],
  ] as const;
  const filterContent = (
    <>
      <div className="filter-heading">
        <h3>Refine your search</h3>
        <button onClick={clear} aria-label="Clear filters">
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
      {fields
        .filter(([, , values]) => values.length > 0)
        .map(([key, label, values]) => (
          <label key={key}>
            {label}
            <select
              value={params.get(key) || ""}
              onChange={(e) => update(key, e.target.value)}
            >
              <option value="">Any {label.toLowerCase()}</option>
              {values.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      <div className="range-label">Budget (₹)</div>
      <div className="range-inputs">
        <label>
          <span>Minimum</span>
          <input
            type="number"
            min="0"
            step="100000"
            placeholder="No minimum"
            value={params.get("min") || ""}
            onChange={(e) => update("min", e.target.value)}
          />
        </label>
        <label>
          <span>Maximum</span>
          <input
            type="number"
            min="0"
            step="100000"
            placeholder="No maximum"
            value={params.get("max") || ""}
            onChange={(e) => update("max", e.target.value)}
          />
        </label>
      </div>
      <div className="range-label">Area (sq.ft.)</div>
      <div className="range-inputs">
        <label>
          <span>Minimum</span>
          <input
            type="number"
            min="0"
            placeholder="No minimum"
            value={params.get("areaMin") || ""}
            onChange={(e) => update("areaMin", e.target.value)}
          />
        </label>
        <label>
          <span>Maximum</span>
          <input
            type="number"
            min="0"
            placeholder="No maximum"
            value={params.get("areaMax") || ""}
            onChange={(e) => update("areaMax", e.target.value)}
          />
        </label>
      </div>
    </>
  );
  return (
    <section className="listing-section container">
      <div className="listing-topbar">
        <label className="listing-search">
          <Search size={19} />
          <input
            aria-label="Search properties"
            placeholder="Search a location, property or keyword…"
            value={params.get("q") || ""}
            onChange={(e) => update("q", e.target.value)}
          />
        </label>
        <button
          className="button button-outline mobile-filter"
          onClick={() => setDrawer(true)}
        >
          <SlidersHorizontal size={16} />
          Filters {active.length > 0 && `(${active.length})`}
        </button>
        <label className="sort-control">
          Sort by
          <select
            value={params.get("sort") || "relevance"}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="relevance">Recommended</option>
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
        </label>
        <div className="view-switch">
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <Grid2X2 size={17} />
          </button>
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      <div className="listing-layout">
        <aside className="listing-filters">
          {filterContent}
          <div className="filter-help">
            <span className="eyebrow">A LITTLE GUIDANCE?</span>
            <h3>
              Your vision.
              <br />
              Our shortlist.
            </h3>
            <p>Let us find the spaces that fit.</p>
            <EnquiryButton className="text-link">
              Let’s Talk <ArrowUpRight size={15} />
            </EnquiryButton>
          </div>
        </aside>
        <div className="listing-results">
          <div className="results-summary">
            <span>
              <strong>{items.length}</strong>{" "}
              {items.length === 1 ? "property" : "properties"} to explore
            </span>
            <span>Considered spaces. New possibilities.</span>
          </div>
          {properties.some((p) => p.demo) && (
            <p className="demo-note">
              Preview collection · Sample inventory and illustrative
              photography. These are not live sale listings.
            </p>
          )}
          {active.length > 0 && (
            <div className="filter-chips">
              {active.map(([key, value]) => (
                <button key={key} onClick={() => update(key, "")}>
                  {key === "max"
                    ? "Budget up to ₹"
                    : key === "min"
                      ? "Budget from ₹"
                      : ""}
                  {value}
                  <X size={12} />
                </button>
              ))}
              <button onClick={clear} className="clear-chip">
                Clear all
              </button>
            </div>
          )}
          <div
            className={`property-grid listing-grid ${view === "list" ? "list-view" : ""}`}
          >
            {items.slice(0, limit).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
            {!items.length && (
              <div className="empty-state">
                <Building2 size={32} />
                <h3>A different search. A new possibility.</h3>
                <p>
                  Try widening your filters, or tell us what you have in mind.
                </p>
                <div className="empty-actions">
                  <button className="button button-outline" onClick={clear}>
                    Clear Filters
                  </button>
                  <EnquiryButton
                    action={sell ? "Sell Property" : "Buy Property"}
                  >
                    Share Your Requirements
                  </EnquiryButton>
                </div>
              </div>
            )}
          </div>
          {items.length > limit && (
            <button
              className="button button-outline load-more"
              onClick={() => setLimit((n) => n + 6)}
            >
              Discover More Properties
            </button>
          )}
        </div>
      </div>
      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="filter-drawer">
            <Dialog.Title className="drawer-title">
              Find your possibilities
            </Dialog.Title>
            <Dialog.Description>
              Refine properties by the details that matter to you.
            </Dialog.Description>
            <Dialog.Close
              className="dialog-close icon-button"
              aria-label="Close filters"
            >
              <X size={19} />
            </Dialog.Close>
            <div className="drawer-filter-content">{filterContent}</div>
            <Dialog.Close className="button button-navy">
              Show {items.length} Properties
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
