"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Building2,
  MessagesSquare,
  Settings as SettingsIcon,
  Quote,
  LogOut,
  Plus,
  Search,
  ArrowUpRight,
  Pencil,
  Archive,
  X,
  Upload,
  LoaderCircle,
  Download,
  Check,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  TriangleAlert,
  ImageIcon,
  Tags,
  Trash2,
  FileText,
} from "lucide-react";
import { ContentEditor } from "./admin-content";
import { Brand } from "./brand";
import { Field } from "./admin-ui";
import { formatPrice } from "@/lib/demo";
import type { Property, Settings, Testimonial } from "@/lib/types";
type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  category: string;
  propertyTitle: string;
  message: string;
  contactTime: string;
  status: string;
  notes: string;
  notificationStatus: string;
  createdAt: string;
};
type Master = {
  id: string;
  kind: "category" | "type";
  name: string;
  active: boolean;
  used: number;
};
const statuses = ["New", "Contacted", "Visit Scheduled", "Qualified", "Closed"];
async function request(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || "The request could not be completed.");
  return data;
}
const emptyProperty: Property = {
  id: "",
  slug: "",
  title: "",
  description: "",
  category: "Residential",
  type: "Apartment",
  location: "",
  price: 0,
  area: 0,
  bedrooms: 0,
  bathrooms: 0,
  furnishing: "Unfurnished",
  possession: "Ready to move",
  status: "Available",
  condition: "New",
  featured: false,
  images: [],
  amenities: [],
  createdAt: "",
  demo: false,
};
export function AdminDashboard({
  user,
}: {
  user: { name: string; role: string };
}) {
  const router = useRouter();
  const [tab, setTab] = useState("properties");
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [edit, setEdit] = useState<Property>();
  const [lead, setLead] = useState<Lead>();
  const [removeLead, setRemoveLead] = useState<Lead>();
  const [review, setReview] = useState<Testimonial & { approved?: boolean }>();
  const [archive, setArchive] = useState<Property>();
  const [saving, setSaving] = useState(false);
  const [masters, setMasters] = useState<Master[]>([]);
  const loadMasters = useCallback(async () => {
    try {
      setMasters(await request("/api/admin/masters"));
    } catch {
      /* the property form falls back to the values already on the property */
    }
  }, []);
  useEffect(() => {
    void loadMasters();
  }, [loadMasters]);
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      if (tab === "properties") {
        const rows: Property[] = await request("/api/admin/properties");
        setProperties(rows);
      } else if (tab === "enquiries")
        setLeads(
          await request(
            `/api/admin/enquiries?q=${encodeURIComponent(query)}&status=${encodeURIComponent(leadStatus)}`,
          ),
        );
      else if (tab === "testimonials")
        setReviews(await request("/api/admin/testimonials"));
      else if (tab === "masters") await loadMasters();
      else if (tab === "content") {
        /* the editor loads its own content */
      } else setSettings(await request("/api/admin/settings"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load data.");
    } finally {
      setBusy(false);
    }
  }, [tab, query, leadStatus, loadMasters]);
  useEffect(() => {
    const timeout = setTimeout(
      () => void load(),
      tab === "enquiries" ? 200 : 0,
    );
    return () => clearTimeout(timeout);
  }, [load, tab]);
  function changeTab(value: string) {
    setQuery("");
    setLeadStatus("");
    setMessage("");
    setTab(value);
  }
  async function logout() {
    try {
      await request("/api/admin/logout", { method: "POST" });
      router.refresh();
    } catch (e) {
      setError(String(e));
    }
  }
  async function saveLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lead) return;
    setSaving(true);
    try {
      const form = new FormData(e.currentTarget);
      await request("/api/admin/enquiries", {
        method: "PATCH",
        body: JSON.stringify({
          id: lead.id,
          status: form.get("status"),
          notes: form.get("notes"),
        }),
      });
      setLead(undefined);
      setMessage("Enquiry updated.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }
  async function doDeleteLead() {
    if (!removeLead) return;
    setSaving(true);
    try {
      await request("/api/admin/enquiries", {
        method: "DELETE",
        body: JSON.stringify({ id: removeLead.id }),
      });
      setRemoveLead(undefined);
      setLead(undefined);
      setMessage("Enquiry deleted.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete.");
      setRemoveLead(undefined);
    } finally {
      setSaving(false);
    }
  }
  async function doArchive() {
    if (!archive) return;
    setSaving(true);
    try {
      await request("/api/admin/properties", {
        method: "DELETE",
        body: JSON.stringify({ id: archive.id }),
      });
      setArchive(undefined);
      setMessage(
        "Property archived. You can restore it by changing its status.",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to archive.");
    } finally {
      setSaving(false);
    }
  }
  const filtered = properties.filter((p) =>
    `${p.title} ${p.location} ${p.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const filteredReviews = reviews.filter((r) =>
    `${r.name} ${r.quote}`.toLowerCase().includes(query.toLowerCase()),
  );
  const count = <T,>(rows: T[], test: (row: T) => boolean) =>
    rows.filter(test).length;
  const stats =
    tab === "properties"
      ? [
          { label: "Total listings", value: properties.length },
          {
            label: "Available",
            value: count(properties, (p) => p.status === "Available"),
          },
          { label: "Featured", value: count(properties, (p) => p.featured) },
          {
            label: "Sold / archived",
            value: count(properties, (p) =>
              ["Sold", "Archived"].includes(p.status),
            ),
          },
        ]
      : tab === "enquiries"
        ? [
            { label: "Total enquiries", value: leads.length },
            { label: "New", value: count(leads, (l) => l.status === "New") },
            {
              label: "In progress",
              value: count(leads, (l) =>
                ["Contacted", "Visit Scheduled", "Qualified"].includes(
                  l.status,
                ),
              ),
            },
            {
              label: "Closed",
              value: count(leads, (l) => l.status === "Closed"),
            },
          ]
        : [];
  const heading = {
    properties: [
      "Properties",
      "Manage listings, pricing, availability and photos.",
    ],
    enquiries: ["Enquiries", "Track and follow up on customer leads."],
    testimonials: ["Testimonials", "Review and publish customer stories."],
    content: ["Page content", "Edit the wording on the Home and About pages."],
    masters: [
      "Categories & types",
      "The lists used when adding properties and filtering them on the website.",
    ],
    settings: [
      "Site settings",
      "Business contact details shown across the website.",
    ],
  }[tab] || ["", ""];
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="adm adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <Brand />
        </div>
        <nav aria-label="Administrator sections">
          <span className="adm-nav-label">Manage</span>
          {[
            { key: "properties", label: "Properties", Icon: Building2 },
            { key: "enquiries", label: "Enquiries", Icon: MessagesSquare },
            { key: "testimonials", label: "Testimonials", Icon: Quote },
            { key: "content", label: "Page content", Icon: FileText },
            { key: "masters", label: "Categories & types", Icon: Tags },
            { key: "settings", label: "Site settings", Icon: SettingsIcon },
          ].map(({ key, label, Icon }) => (
            <button
              className={tab === key ? "active" : ""}
              aria-current={tab === key ? "page" : undefined}
              key={key}
              onClick={() => changeTab(key)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="adm-site-link"
          >
            <ExternalLink size={15} />
            View website
          </a>
          <div className="adm-user">
            <span className="adm-avatar" aria-hidden="true">
              {initials}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>
                {user.role === "ADMIN" ? "Administrator" : "Editor"}
              </small>
            </div>
            <button onClick={logout} aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-topbar">
          <div>
            <h1>{heading[0]}</h1>
            <p>{heading[1]}</p>
          </div>
          <div className="adm-topbar-actions">
            {tab === "properties" && (
              <button
                className="adm-btn primary"
                onClick={() =>
                  setEdit({
                    ...emptyProperty,
                    id: `DR-${Date.now().toString(36).toUpperCase()}`,
                  })
                }
              >
                <Plus size={16} />
                Add property
              </button>
            )}
            {tab === "testimonials" && user.role === "ADMIN" && (
              <button
                className="adm-btn primary"
                onClick={() =>
                  setReview({
                    id: "",
                    name: "",
                    type: "Buyers",
                    quote: "",
                    location: "",
                    approved: false,
                  })
                }
              >
                <Plus size={16} />
                Add testimonial
              </button>
            )}
            {tab === "enquiries" && (
              <a
                href={`/api/admin/enquiries?export=csv&q=${encodeURIComponent(query)}&status=${encodeURIComponent(leadStatus)}`}
                className="adm-btn"
              >
                <Download size={16} />
                Export CSV
              </a>
            )}
          </div>
        </header>
        <div className="adm-content">
          {message && (
            <div className="adm-alert success" role="status">
              <Check size={16} />
              {message}
              <button
                aria-label="Dismiss notification"
                onClick={() => setMessage("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {error && (
            <div className="adm-alert error" role="alert">
              <TriangleAlert size={16} />
              {error}
            </div>
          )}
          {!busy && stats.length > 0 && (
            <div className="adm-stats">
              {stats.map((s) => (
                <div className="adm-stat" key={s.label}>
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>
          )}
          {tab !== "settings" && tab !== "masters" && tab !== "content" && (
            <div className="adm-toolbar">
              <label className="adm-search">
                <Search size={16} />
                <input
                  aria-label="Search records"
                  placeholder={
                    tab === "properties"
                      ? "Search by title, location or ID"
                      : tab === "enquiries"
                        ? "Search by name, phone or property"
                        : "Search testimonials"
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {tab === "enquiries" && (
                <select
                  aria-label="Filter lead status"
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                >
                  <option value="">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          {busy ? (
            <div className="adm-loading" role="status">
              <LoaderCircle className="spin" />
              Loading…
            </div>
          ) : tab === "properties" ? (
            <div className="adm-panel">
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Visibility</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="adm-property">
                            {p.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0]} alt="" loading="lazy" />
                            ) : (
                              <span className="adm-thumb-empty">
                                <ImageIcon size={18} />
                              </span>
                            )}
                            <div>
                              <strong>{p.title}</strong>
                              <small>
                                {p.id} · {p.location}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="nowrap">{formatPrice(p.price)}</td>
                        <td>
                          <span
                            className={`adm-badge ${propertyTone[p.status] || "neutral"}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          {p.demo ? (
                            <span className="adm-badge warn">Sample</span>
                          ) : p.featured ? (
                            <span className="adm-badge accent">Featured</span>
                          ) : (
                            <span className="adm-badge neutral">Published</span>
                          )}
                        </td>
                        <td>
                          <div className="adm-row-actions">
                            <button
                              aria-label={`Edit ${p.title}`}
                              title="Edit"
                              onClick={() => setEdit(p)}
                            >
                              <Pencil size={16} />
                            </button>
                            <a
                              href={`/property/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`View ${p.title}`}
                              title="View on website"
                            >
                              <ArrowUpRight size={16} />
                            </a>
                            {user.role === "ADMIN" &&
                              p.status !== "Archived" && (
                                <button
                                  className="danger"
                                  aria-label={`Archive ${p.title}`}
                                  title="Archive"
                                  onClick={() => setArchive(p)}
                                >
                                  <Archive size={16} />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <div className="adm-empty">
                  <Building2 size={28} />
                  <strong>No properties found</strong>
                  <span>Add a listing or adjust your search.</span>
                </div>
              )}
            </div>
          ) : tab === "enquiries" ? (
            <div className="adm-panel">
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Requirement</th>
                      <th>Status</th>
                      <th>Received</th>
                      <th className="right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <small>{p.phone}</small>
                        </td>
                        <td>
                          {p.type}
                          <small>{p.propertyTitle || p.category}</small>
                        </td>
                        <td>
                          <span
                            className={`adm-badge ${leadTone[p.status] || "neutral"}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="nowrap">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <div className="adm-row-actions">
                            <button
                              className="adm-btn small"
                              onClick={() => setLead(p)}
                            >
                              View
                            </button>
                            {user.role === "ADMIN" && (
                              <button
                                className="danger"
                                aria-label={`Delete enquiry from ${p.name}`}
                                title="Delete"
                                onClick={() => setRemoveLead(p)}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!leads.length && (
                <div className="adm-empty">
                  <MessagesSquare size={28} />
                  <strong>No enquiries found</strong>
                  <span>New customer enquiries will appear here.</span>
                </div>
              )}
            </div>
          ) : tab === "testimonials" ? (
            <div className="adm-cards">
              {filteredReviews.map((r) => (
                <article className="adm-card" key={r.id}>
                  <div className="adm-card-head">
                    <span className="adm-badge neutral">{r.type}</span>
                    {r.rating ? (
                      <span className="adm-rating">★ {r.rating}</span>
                    ) : null}
                  </div>
                  <h3>{r.name}</h3>
                  <p>{r.quote}</p>
                  <div className="adm-card-foot">
                    <span>{r.location}</span>
                    <button
                      className="adm-btn small"
                      onClick={() => setReview(r)}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                </article>
              ))}
              {!filteredReviews.length && (
                <div className="adm-panel adm-empty wide">
                  <Quote size={28} />
                  <strong>No testimonials yet</strong>
                  <span>Publish only genuine, approved customer stories.</span>
                </div>
              )}
            </div>
          ) : tab === "content" ? (
            <ContentEditor
              canEdit={user.role === "ADMIN"}
              onSaved={setMessage}
              onError={setError}
            />
          ) : tab === "masters" ? (
            <MastersPanel
              masters={masters}
              canEdit={user.role === "ADMIN"}
              onChanged={(text) => {
                setMessage(text);
                void loadMasters();
              }}
              onError={setError}
            />
          ) : settings ? (
            <SettingsForm
              settings={settings}
              canEdit={user.role === "ADMIN"}
              onSaved={() => {
                setMessage("Site settings updated.");
                void load();
              }}
            />
          ) : null}
        </div>
      </div>
      <Dialog.Root
        open={!!edit}
        onOpenChange={(v) => {
          if (!v) setEdit(undefined);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay adm-overlay" />
          <Dialog.Content className="dialog-content adm adm-dialog wide">
            <div className="adm-dialog-head">
              <div>
                <Dialog.Title className="adm-dialog-title">
                  {edit?.title ? "Edit property" : "Add property"}
                </Dialog.Title>
                <Dialog.Description className="adm-dialog-desc">
                  Review every detail before publishing. Accurate listings build
                  trust.
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="adm-icon-btn"
                aria-label="Close property editor"
              >
                <X size={18} />
              </Dialog.Close>
            </div>
            {edit && (
              <PropertyForm
                property={edit}
                categories={masters
                  .filter((m) => m.kind === "category" && m.active)
                  .map((m) => m.name)}
                types={masters
                  .filter((m) => m.kind === "type" && m.active)
                  .map((m) => m.name)}
                onSaved={() => {
                  setEdit(undefined);
                  setMessage("Property saved.");
                  void load();
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!lead}
        onOpenChange={(v) => {
          if (!v) setLead(undefined);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay adm-overlay" />
          <Dialog.Content className="dialog-content adm adm-dialog">
            <div className="adm-dialog-head">
              <div>
                <Dialog.Title className="adm-dialog-title">
                  {lead?.name}
                </Dialog.Title>
                <Dialog.Description className="adm-dialog-desc">
                  {lead?.type} · {lead?.propertyTitle || lead?.category}
                </Dialog.Description>
              </div>
              <Dialog.Close className="adm-icon-btn" aria-label="Close lead">
                <X size={18} />
              </Dialog.Close>
            </div>
            <form className="adm-form" onSubmit={saveLead}>
              <div className="adm-dialog-body">
                <dl className="adm-details">
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${lead?.phone}`}>{lead?.phone}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{lead?.email || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Preferred contact time</dt>
                    <dd>{lead?.contactTime || "Any time"}</dd>
                  </div>
                  <div>
                    <dt>Email notification</dt>
                    <dd>{lead?.notificationStatus}</dd>
                  </div>
                  <div className="full">
                    <dt>Message</dt>
                    <dd>{lead?.message || "No additional message"}</dd>
                  </div>
                </dl>
                <Field label="Status">
                  <select name="status" defaultValue={lead?.status}>
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Internal notes">
                  <textarea name="notes" defaultValue={lead?.notes} rows={4} />
                </Field>
              </div>
              <div className="adm-dialog-foot">
                {user.role === "ADMIN" && lead && (
                  <button
                    type="button"
                    className="adm-btn danger-outline"
                    style={{ marginRight: "auto" }}
                    onClick={() => setRemoveLead(lead)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
                <Dialog.Close className="adm-btn">Cancel</Dialog.Close>
                <button className="adm-btn primary" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!removeLead}
        onOpenChange={(v) => {
          if (!v) setRemoveLead(undefined);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay adm-overlay" />
          <Dialog.Content className="dialog-content adm adm-dialog narrow">
            <div className="adm-dialog-head">
              <div>
                <Dialog.Title className="adm-dialog-title">
                  Delete this enquiry?
                </Dialog.Title>
                <Dialog.Description className="adm-dialog-desc">
                  The enquiry from {removeLead?.name} will be permanently
                  removed, including your notes. This cannot be undone.
                </Dialog.Description>
              </div>
            </div>
            <div className="adm-dialog-foot">
              <Dialog.Close className="adm-btn">Keep enquiry</Dialog.Close>
              <button
                className="adm-btn danger"
                disabled={saving}
                onClick={doDeleteLead}
              >
                {saving ? "Deleting…" : "Delete enquiry"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!archive}
        onOpenChange={(v) => {
          if (!v) setArchive(undefined);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay adm-overlay" />
          <Dialog.Content className="dialog-content adm adm-dialog narrow">
            <div className="adm-dialog-head">
              <div>
                <Dialog.Title className="adm-dialog-title">
                  Archive this listing?
                </Dialog.Title>
                <Dialog.Description className="adm-dialog-desc">
                  “{archive?.title}” will be removed from the public website.
                  You can restore it later by changing its status.
                </Dialog.Description>
              </div>
            </div>
            <div className="adm-dialog-foot">
              <Dialog.Close className="adm-btn">Keep property</Dialog.Close>
              <button
                className="adm-btn danger"
                disabled={saving}
                onClick={doArchive}
              >
                {saving ? "Archiving…" : "Archive property"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!review}
        onOpenChange={(v) => {
          if (!v) setReview(undefined);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay adm-overlay" />
          <Dialog.Content className="dialog-content adm adm-dialog">
            <div className="adm-dialog-head">
              <div>
                <Dialog.Title className="adm-dialog-title">
                  {review?.id ? "Edit testimonial" : "Add testimonial"}
                </Dialog.Title>
                <Dialog.Description className="adm-dialog-desc">
                  Publish only genuine experiences, with the customer’s
                  permission.
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="adm-icon-btn"
                aria-label="Close testimonial editor"
              >
                <X size={18} />
              </Dialog.Close>
            </div>
            {review && (
              <TestimonialForm
                review={review}
                onSaved={() => {
                  setReview(undefined);
                  setMessage("Testimonial saved.");
                  void load();
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
const propertyTone: Record<string, string> = {
  Available: "success",
  Sold: "info",
  Inactive: "neutral",
  Archived: "neutral",
};
const leadTone: Record<string, string> = {
  New: "info",
  Contacted: "warn",
  "Visit Scheduled": "accent",
  Qualified: "success",
  Closed: "neutral",
};
function PropertyForm({
  property: p,
  categories,
  types,
  onSaved,
}: {
  property: Property;
  categories: string[];
  types: string[];
  onSaved: () => void;
}) {
  // Keep a property's current value selectable even if it was switched off later.
  const withCurrent = (list: string[], current: string) =>
    current && !list.includes(current) ? [current, ...list] : list;
  const [images, setImages] = useState(p.images);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  async function upload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const signed = await request("/api/admin/media", {
          method: "POST",
          body: JSON.stringify({ type: file.type, size: file.size }),
        });
        if (signed.local) {
          const body = new FormData();
          body.append("file", file);
          const res = await fetch("/api/admin/media", { method: "POST", body });
          const data = await res.json().catch(() => ({}));
          if (!res.ok)
            throw new Error(data.error || "The image upload failed.");
          uploaded.push(data.url);
          continue;
        }
        const res = await fetch(signed.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok)
          throw new Error("The image upload failed. Please try again.");
        uploaded.push(signed.url);
      }
      setImages((i) => [...i, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to upload.");
    } finally {
      setUploading(false);
    }
  }
  function move(index: number, direction: number) {
    setImages((prev) => {
      const next = [...prev];
      const swap = index + direction;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form);
    try {
      await request("/api/admin/properties", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          ...Object.fromEntries(
            [
              "carpetArea",
              "plotArea",
              "balconies",
              "parking",
              "latitude",
              "longitude",
            ].map((key) => [
              key,
              form.get(key) ? Number(form.get(key)) : undefined,
            ]),
          ),
          showOnBuy: form.has("showOnBuy"),
          showOnSell: form.has("showOnSell"),
          landmarks: String(form.get("landmarks") || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          price: Number(data.price),
          area: Number(data.area),
          bedrooms: Number(data.bedrooms),
          bathrooms: Number(data.bathrooms),
          featured: form.has("featured"),
          demo: form.has("demo"),
          images,
          amenities: String(data.amenities)
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  const num = (
    name: string,
    label: string,
    value: number | undefined,
    extra = {},
  ) => (
    <Field label={label}>
      <input
        type="number"
        step="any"
        name={name}
        defaultValue={value}
        {...extra}
      />
    </Field>
  );
  return (
    <form className="adm-form" onSubmit={submit}>
      <div className="adm-dialog-body">
        <section className="adm-section">
          <h4>Basic information</h4>
          <div className="adm-grid">
            <Field label="Property title" wide>
              <input
                name="title"
                defaultValue={p.title}
                required
                minLength={3}
              />
            </Field>
            <Field label="Property ID">
              <input
                name="id"
                defaultValue={p.id}
                required
                readOnly={!!p.title}
              />
            </Field>
            <Field
              label="URL slug"
              hint="Lowercase letters, numbers and hyphens."
            >
              <input
                name="slug"
                defaultValue={p.slug}
                required
                pattern="[a-z0-9-]{3,150}"
                placeholder="your-property-name"
              />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={p.category}>
                {withCurrent(categories, p.category).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Property type">
              <select name="type" defaultValue={p.type}>
                {withCurrent(types, p.type).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input name="location" defaultValue={p.location} required />
            </Field>
            <Field label="Address">
              <input name="address" defaultValue={p.address} />
            </Field>
          </div>
        </section>
        <section className="adm-section">
          <h4>Pricing and specifications</h4>
          <div className="adm-grid three">
            {num("price", "Price (₹)", p.price || undefined, {
              min: 1,
              required: true,
            })}
            {num("area", "Built-up area (sq.ft.)", p.area || undefined, {
              min: 1,
              required: true,
            })}
            {num("bedrooms", "Bedrooms", p.bedrooms, {
              min: 0,
              max: 100,
              step: 1,
            })}
            {num("bathrooms", "Bathrooms", p.bathrooms, {
              min: 0,
              max: 100,
              step: 1,
            })}
            <Field label="Furnishing">
              <select name="furnishing" defaultValue={p.furnishing}>
                {["Unfurnished", "Semi-furnished", "Furnished"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Possession">
              <select name="possession" defaultValue={p.possession}>
                {["Ready to move", "Under construction", "Immediate"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Condition">
              <select name="condition" defaultValue={p.condition}>
                {["New", "Resale"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Availability">
              <select name="status" defaultValue={p.status}>
                {["Available", "Sold", "Inactive", "Archived"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <details className="adm-details-toggle">
            <summary>More specifications</summary>
            <div className="adm-grid three">
              {num("carpetArea", "Carpet area (sq.ft.)", p.carpetArea)}
              {num("plotArea", "Plot area (sq.ft.)", p.plotArea)}
              {num("balconies", "Balconies", p.balconies)}
              {num("parking", "Parking spaces", p.parking)}
              {num("latitude", "Latitude", p.latitude)}
              {num("longitude", "Longitude", p.longitude)}
              <Field label="Floor">
                <input name="floor" defaultValue={p.floor} />
              </Field>
              <Field label="Facing">
                <input name="facing" defaultValue={p.facing} />
              </Field>
              <Field label="Property age">
                <input name="age" defaultValue={p.age} />
              </Field>
              <Field label="Video tour (HTTPS URL)" wide>
                <input name="videoUrl" defaultValue={p.videoUrl} />
              </Field>
              <Field label="Nearby landmarks" hint="Separate with commas." wide>
                <input
                  name="landmarks"
                  defaultValue={p.landmarks?.join(", ")}
                />
              </Field>
              <Field label="Documentation notes" wide>
                <textarea
                  name="documentation"
                  defaultValue={p.documentation}
                  rows={2}
                />
              </Field>
            </div>
          </details>
        </section>
        <section className="adm-section">
          <h4>Description and amenities</h4>
          <div className="adm-grid">
            <Field label="Description" wide>
              <textarea
                name="description"
                rows={5}
                required
                minLength={10}
                defaultValue={p.description}
              />
            </Field>
            <Field label="Amenities" hint="Separate with commas." wide>
              <input name="amenities" defaultValue={p.amenities.join(", ")} />
            </Field>
          </div>
        </section>
        <section className="adm-section">
          <h4>Photos</h4>
          <p className="adm-hint">
            The first photo is the main image. Use the arrows to reorder. JPG,
            PNG or WebP, up to 10 MB each.
          </p>
          <div className="adm-images">
            {images.map((url, i) => (
              <div className="adm-image-row" key={`${i}-${url.slice(-12)}`}>
                <span className="adm-image-thumb">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                  {i === 0 && <em>Main</em>}
                </span>
                <input
                  aria-label={`Image ${i + 1} URL`}
                  placeholder="https://…"
                  value={url}
                  onChange={(e) =>
                    setImages((x) =>
                      x.map((v, j) => (i === j ? e.target.value : v)),
                    )
                  }
                />
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label="Move image up"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label="Move image down"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn danger"
                  aria-label="Remove image"
                  onClick={() => setImages((x) => x.filter((_, j) => j !== i))}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="adm-image-actions">
            <label className={`adm-btn${uploading ? " disabled" : ""}`}>
              {uploading ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? "Uploading…" : "Upload photos"}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const input = e.target;
                  void upload(input.files).finally(() => (input.value = ""));
                }}
                disabled={uploading}
              />
            </label>
            <button
              type="button"
              className="adm-btn ghost"
              onClick={() => setImages((i) => [...i, ""])}
            >
              <Plus size={16} />
              Add image URL
            </button>
          </div>
        </section>
        <section className="adm-section">
          <h4>Publishing</h4>
          <div className="adm-checks">
            <label>
              <input
                name="showOnBuy"
                type="checkbox"
                defaultChecked={p.showOnBuy !== false}
              />
              Show on Buy Properties
            </label>
            <label>
              <input
                name="showOnSell"
                type="checkbox"
                defaultChecked={p.showOnSell !== false}
              />
              Show on Sell Properties
            </label>
            <label>
              <input
                name="featured"
                type="checkbox"
                defaultChecked={p.featured}
              />
              Feature on homepage
            </label>
            <label>
              <input name="demo" type="checkbox" defaultChecked={p.demo} />
              Mark as sample listing
            </label>
          </div>
        </section>
      </div>
      <div className="adm-dialog-foot">
        {error && (
          <div className="adm-alert error inline" role="alert">
            <TriangleAlert size={16} />
            {error}
          </div>
        )}
        <Dialog.Close className="adm-btn">Cancel</Dialog.Close>
        <button className="adm-btn primary" disabled={busy || uploading}>
          {busy ? "Saving…" : "Save property"}
        </button>
      </div>
    </form>
  );
}
function SettingsForm({
  settings: s,
  canEdit,
  onSaved,
}: {
  settings: Settings;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await request("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          phone: form.get("phone"),
          whatsapp: form.get("whatsapp"),
          email: form.get("email"),
          address: form.get("address"),
          hours: form.get("hours"),
          areas: String(form.get("areas"))
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          rentalEnabled: form.has("rentalEnabled"),
          leadGating: form.has("leadGating"),
          demo: form.has("demo"),
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="adm-form adm-panel adm-settings" onSubmit={submit}>
      <fieldset disabled={!canEdit}>
        <div className="adm-panel-head">
          <h3>Business contact details</h3>
          <p>
            These details appear in the website footer and contact page. Use the
            country code for phone numbers.
          </p>
        </div>
        <div className="adm-panel-body">
          <div className="adm-grid">
            <Field label="Phone">
              <input name="phone" defaultValue={s.phone} placeholder="+91…" />
            </Field>
            <Field label="WhatsApp number" hint="Country code and digits only.">
              <input
                name="whatsapp"
                defaultValue={s.whatsapp}
                placeholder="91…"
              />
            </Field>
            <Field label="Email">
              <input type="email" name="email" defaultValue={s.email} />
            </Field>
            <Field label="Business hours">
              <input name="hours" defaultValue={s.hours} />
            </Field>
            <Field label="Office address" wide>
              <textarea name="address" defaultValue={s.address} rows={3} />
            </Field>
            <Field label="Areas served" hint="Separate with commas." wide>
              <input name="areas" defaultValue={s.areas.join(", ")} />
            </Field>
          </div>
          <div className="adm-checks">
            <label>
              <input type="checkbox" name="demo" defaultChecked={s.demo} />
              Mark contact details as temporary
            </label>
          </div>
        </div>
        <div className="adm-panel-foot">
          {error && (
            <div className="adm-alert error inline" role="alert">
              <TriangleAlert size={16} />
              {error}
            </div>
          )}
          {!canEdit && (
            <span className="adm-hint">
              Only an administrator can update site settings.
            </span>
          )}
          <button className="adm-btn primary" disabled={busy || !canEdit}>
            {busy ? "Saving…" : "Save settings"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
function TestimonialForm({
  review: r,
  onSaved,
}: {
  review: Testimonial & { approved?: boolean };
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await request("/api/admin/testimonials", {
        method: "POST",
        body: JSON.stringify({
          id: r.id || undefined,
          name: form.get("name"),
          type: form.get("type"),
          location: form.get("location"),
          quote: form.get("quote"),
          rating: form.get("rating") ? Number(form.get("rating")) : null,
          image: form.get("image"),
          videoUrl: form.get("videoUrl"),
          approved: form.has("approved"),
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="adm-form" onSubmit={submit}>
      <div className="adm-dialog-body">
        <div className="adm-grid">
          <Field label="Customer name">
            <input name="name" required defaultValue={r.name} />
          </Field>
          <Field label="Customer type">
            <select name="type" defaultValue={r.type}>
              {["Buyers", "Sellers", "Investors"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input name="location" defaultValue={r.location} />
          </Field>
          <Field label="Rating (optional)">
            <select name="rating" defaultValue={r.rating || ""}>
              <option value="">No rating provided</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option value={n} key={n}>
                  {n} {n === 1 ? "star" : "stars"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Customer quote" wide>
            <textarea
              name="quote"
              required
              minLength={10}
              rows={4}
              defaultValue={r.quote}
            />
          </Field>
          <Field label="Customer image (HTTPS URL)" wide>
            <input name="image" defaultValue={r.image} />
          </Field>
          <Field label="Video testimonial (HTTPS URL)" wide>
            <input name="videoUrl" defaultValue={r.videoUrl} />
          </Field>
        </div>
        <div className="adm-checks">
          <label>
            <input
              name="approved"
              type="checkbox"
              defaultChecked={r.approved}
            />
            Customer has approved publication
          </label>
        </div>
      </div>
      <div className="adm-dialog-foot">
        {error && (
          <div className="adm-alert error inline" role="alert">
            <TriangleAlert size={16} />
            {error}
          </div>
        )}
        <Dialog.Close className="adm-btn">Cancel</Dialog.Close>
        <button className="adm-btn primary" disabled={busy}>
          {busy ? "Saving…" : "Save testimonial"}
        </button>
      </div>
    </form>
  );
}

function MastersPanel({
  masters,
  canEdit,
  onChanged,
  onError,
}: {
  masters: Master[];
  canEdit: boolean;
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="adm-masters">
      <MasterList
        kind="category"
        title="Property categories"
        hint="For example Residential, Commercial or Land."
        items={masters.filter((m) => m.kind === "category")}
        canEdit={canEdit}
        onChanged={onChanged}
        onError={onError}
      />
      <MasterList
        kind="type"
        title="Property types"
        hint="For example Apartment, Office or Farm house."
        items={masters.filter((m) => m.kind === "type")}
        canEdit={canEdit}
        onChanged={onChanged}
        onError={onError}
      />
    </div>
  );
}
function MasterList({
  kind,
  title,
  hint,
  items,
  canEdit,
  onChanged,
  onError,
}: {
  kind: "category" | "type";
  title: string;
  hint: string;
  items: Master[];
  canEdit: boolean;
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string>();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(item: Partial<Master>, text: string) {
    setBusy(true);
    onError("");
    try {
      await request("/api/admin/masters", {
        method: "POST",
        body: JSON.stringify({
          id: item.id,
          kind,
          name: item.name,
          active: item.active ?? true,
        }),
      });
      setEditing(undefined);
      onChanged(text);
      return true;
    } catch (e) {
      onError(e instanceof Error ? e.message : "Unable to save.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: Master) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setBusy(true);
    onError("");
    try {
      await request("/api/admin/masters", {
        method: "DELETE",
        body: JSON.stringify({ id: item.id }),
      });
      onChanged(`"${item.name}" deleted.`);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Unable to delete.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="adm-panel adm-master">
      <div className="adm-panel-head">
        <h3>{title}</h3>
        <p>{hint}</p>
      </div>
      {canEdit && (
        <form
          className="adm-master-add"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await save({ name }, `"${name.trim()}" added.`)) setName("");
          }}
        >
          <input
            aria-label={`New ${kind}`}
            placeholder={kind === "category" ? "Add a category" : "Add a type"}
            value={name}
            maxLength={kind === "category" ? 30 : 50}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="adm-btn primary"
            disabled={busy || name.trim().length < 2}
          >
            <Plus size={16} />
            Add
          </button>
        </form>
      )}
      <ul className="adm-master-list">
        {items.map((item) => (
          <li key={item.id} className={item.active ? "" : "off"}>
            {editing === item.id ? (
              <form
                className="adm-master-edit"
                onSubmit={(e) => {
                  e.preventDefault();
                  void save({ ...item, name: draft }, "Name updated.");
                }}
              >
                <input
                  autoFocus
                  aria-label="Name"
                  value={draft}
                  maxLength={kind === "category" ? 30 : 50}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button className="adm-btn small primary" disabled={busy}>
                  Save
                </button>
                <button
                  type="button"
                  className="adm-btn small"
                  onClick={() => setEditing(undefined)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.used
                      ? `${item.used} ${item.used === 1 ? "property" : "properties"}`
                      : "Not used yet"}
                    {item.active ? "" : " · Hidden from new listings"}
                  </small>
                </div>
                {canEdit && (
                  <div className="adm-row-actions">
                    <button
                      className="adm-btn small"
                      disabled={busy}
                      onClick={() =>
                        void save(
                          { ...item, active: !item.active },
                          item.active ? "Turned off." : "Turned on.",
                        )
                      }
                    >
                      {item.active ? "Turn off" : "Turn on"}
                    </button>
                    <button
                      aria-label={`Rename ${item.name}`}
                      title="Rename"
                      onClick={() => {
                        setEditing(item.id);
                        setDraft(item.name);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="danger"
                      aria-label={`Delete ${item.name}`}
                      title="Delete"
                      disabled={busy || item.used > 0}
                      onClick={() => void remove(item)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
        {!items.length && <li className="adm-empty-row">Nothing added yet.</li>}
      </ul>
    </section>
  );
}
