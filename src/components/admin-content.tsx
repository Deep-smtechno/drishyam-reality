"use client";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { defaultContent, type SiteContent } from "@/lib/content";
import { Field } from "./admin-ui";
type Row = { path: string; label: string; area?: boolean; wide?: boolean };
type Group = { title: string; hint?: string; rows: Row[] };
const t = (path: string, label: string, wide = false): Row => ({
  path,
  label,
  wide,
});
const a = (path: string, label: string): Row => ({
  path,
  label,
  area: true,
  wide: true,
});
/** Fixed-length lists: each entry has a title and a line of text. */
const list = (prefix: string, count: number, noun: string): Row[] =>
  Array.from({ length: count }, (_, i) => [
    t(`${prefix}.${i}.title`, `${noun} ${i + 1} · title`),
    a(`${prefix}.${i}.text`, `${noun} ${i + 1} · text`),
  ]).flat();
const pages: Record<string, Group[]> = {
  home: [
    {
      title: "Top banner",
      hint: "The large photo at the top of the home page.",
      rows: [
        t("home.hero.line1", "Headline, first line"),
        t("home.hero.line2", "Headline, second line"),
        t("home.hero.tagline", "Small line under the headline"),
        a("home.hero.intro", "Intro text in the glass card"),
        t("home.hero.primaryButton", "First button"),
        t("home.hero.secondaryButton", "Second button"),
      ],
    },
    {
      title: "About section",
      rows: [
        t("home.about.label", "Small label"),
        t("home.about.heading", "Heading", true),
        a("home.about.paragraph1", "First paragraph"),
        a("home.about.paragraph2", "Second paragraph"),
        ...list("home.about.points", 4, "Point"),
        t("home.about.button", "Button"),
      ],
    },
    {
      title: "Featured properties",
      rows: [
        t("home.featured.heading", "Heading"),
        t("home.featured.subheading", "Line beside the heading"),
      ],
    },
    {
      title: "Buying and selling",
      rows: [
        t("home.routes.buyingTitle", "Buying · title"),
        t("home.routes.buyingLink", "Buying · link text"),
        a("home.routes.buyingText", "Buying · text"),
        t("home.routes.sellingTitle", "Selling · title"),
        t("home.routes.sellingLink", "Selling · link text"),
        a("home.routes.sellingText", "Selling · text"),
      ],
    },
    {
      title: "How it works",
      hint: "Five steps for buyers and five for sellers.",
      rows: [
        t("home.process.heading", "Heading", true),
        ...list("home.process.buyer", 5, "Buying step"),
        ...list("home.process.seller", 5, "Selling step"),
      ],
    },
    {
      title: "Reviews and closing section",
      rows: [
        t("home.testimonials.heading", "Reviews heading", true),
        t("home.cta.heading", "Closing heading", true),
        a("home.cta.text", "Closing text"),
        t("home.cta.primaryButton", "First button"),
        t("home.cta.secondaryButton", "Second button"),
      ],
    },
  ],
  about: [
    {
      title: "Top banner",
      rows: [
        t("about.hero.title", "Title", true),
        a("about.hero.description", "Short description"),
      ],
    },
    {
      title: "Our story",
      rows: [
        t("about.story.label", "Small label"),
        t("about.story.heading", "Heading", true),
        a("about.story.paragraph1", "First paragraph"),
        a("about.story.paragraph2", "Second paragraph"),
        a("about.story.paragraph3", "Third paragraph"),
      ],
    },
    {
      title: "What we stand for",
      rows: [
        t("about.values.label", "Small label"),
        t("about.values.heading", "Heading", true),
        ...list("about.values.items", 3, "Card"),
      ],
    },
    {
      title: "How we can help",
      rows: [
        t("about.services.label", "Small label"),
        t("about.services.heading", "Heading", true),
        ...list("about.services.items", 3, "Card"),
      ],
    },
    {
      title: "Architectural vision",
      rows: [
        t("about.vision.label", "Small label"),
        t("about.vision.heading", "Heading", true),
        a("about.vision.text", "Text"),
      ],
    },
  ],
};
function read(obj: unknown, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
  return typeof value === "string" ? value : "";
}
function write(obj: SiteContent, path: string, value: string): SiteContent {
  const next = structuredClone(obj) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let node = next;
  for (const k of keys.slice(0, -1)) node = node[k] as Record<string, unknown>;
  node[keys[keys.length - 1]] = value;
  return next as unknown as SiteContent;
}
export function ContentEditor({
  canEdit,
  onSaved,
  onError,
}: {
  canEdit: boolean;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [content, setContent] = useState<SiteContent>();
  const [page, setPage] = useState<"home" | "about">("home");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then(setContent)
      .catch(() => onError("Unable to load the page content."));
  }, [onError]);
  if (!content)
    return (
      <div className="adm-loading" role="status">
        <LoaderCircle className="spin" />
        Loading…
      </div>
    );
  async function save() {
    setSaving(true);
    onError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Unable to save.");
      setDirty(false);
      onSaved("Page content saved. It is live on the website.");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="adm-content-editor">
      <div className="adm-content-bar">
        <div className="adm-segment" role="tablist" aria-label="Page">
          {(["home", "about"] as const).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={page === key}
              className={page === key ? "active" : ""}
              onClick={() => setPage(key)}
            >
              {key === "home" ? "Home page" : "About page"}
            </button>
          ))}
        </div>
        <div className="adm-content-actions">
          {canEdit && (
            <button
              className="adm-btn"
              onClick={() => {
                if (
                  window.confirm(
                    "Put the original wording back in the form? Nothing changes on the website until you save.",
                  )
                ) {
                  setContent(structuredClone(defaultContent));
                  setDirty(true);
                }
              }}
            >
              Restore original wording
            </button>
          )}
          <button
            className="adm-btn primary"
            disabled={!canEdit || saving || !dirty}
            onClick={save}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
      {!canEdit && (
        <p className="adm-hint">Only an administrator can edit page content.</p>
      )}
      {pages[page].map((group) => (
        <section className="adm-panel adm-content-group" key={group.title}>
          <div className="adm-panel-head">
            <h3>{group.title}</h3>
            {group.hint && <p>{group.hint}</p>}
          </div>
          <fieldset disabled={!canEdit} className="adm-panel-body">
            <div className="adm-grid">
              {group.rows.map((row) => (
                <Field key={row.path} label={row.label} wide={row.wide}>
                  {row.area ? (
                    <textarea
                      rows={2}
                      maxLength={1200}
                      value={read(content, row.path)}
                      onChange={(e) => {
                        setContent(write(content, row.path, e.target.value));
                        setDirty(true);
                      }}
                    />
                  ) : (
                    <input
                      maxLength={300}
                      value={read(content, row.path)}
                      onChange={(e) => {
                        setContent(write(content, row.path, e.target.value));
                        setDirty(true);
                      }}
                    />
                  )}
                </Field>
              ))}
            </div>
          </fieldset>
        </section>
      ))}
    </div>
  );
}
