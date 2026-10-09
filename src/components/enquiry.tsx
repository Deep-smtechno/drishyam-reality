"use client";
import { createContext, useContext, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  ArrowUpRight,
  Check,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { enquirySchema, type EnquiryInput } from "@/lib/validation";
import type { Property, Settings } from "@/lib/types";
type Context = {
  openEnquiry: (action: string, property?: Property) => void;
  settings: Settings;
  categories: string[];
};
const EnquiryContext = createContext<Context | null>(null);
export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("Enquiry provider missing");
  return ctx;
}
export function EnquiryProvider({
  children,
  settings,
  categories,
}: {
  children: React.ReactNode;
  settings: Settings;
  categories: string[];
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("Property Consultation");
  const [property, setProperty] = useState<Property>();
  const [success, setSuccess] = useState(false);
  return (
    <EnquiryContext.Provider
      value={{
        settings,
        categories,
        openEnquiry: (a, p) => {
          setAction(a);
          setProperty(p);
          setSuccess(false);
          setOpen(true);
        },
      }}
    >
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Close
              className="dialog-close icon-button"
              aria-label="Close enquiry"
            >
              <X size={21} />
            </Dialog.Close>
            <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
            <Dialog.Title className="dialog-title">
              Let’s make it <em>real.</em>
            </Dialog.Title>
            <Dialog.Description>
              {property
                ? `${action} · ${property.title} · ${property.id}`
                : "Tell us what you have in mind. We’ll help you find the way forward."}
            </Dialog.Description>
            {success ? (
              <div className="form-success" role="status">
                <span className="success-icon">
                  <Check />
                </span>
                <h3>Thank you for reaching out.</h3>
                <p>Your enquiry has been saved. Our team will get in touch.</p>
                <Dialog.Close className="button button-navy">Done</Dialog.Close>
              </div>
            ) : (
              <EnquiryForm
                action={action}
                property={property}
                onSuccess={() => setSuccess(true)}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {settings.whatsapp && /^\+?\d{10,15}$/.test(settings.whatsapp) && (
        <a
          className="whatsapp-float"
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Drishyam Realty, I would like to enquire about a property.")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Enquire on WhatsApp"
        >
          <MessageCircle size={25} />
        </a>
      )}
    </EnquiryContext.Provider>
  );
}
export function EnquiryButton({
  children,
  action = "Property Consultation",
  property,
  className = "button button-navy",
}: {
  children: React.ReactNode;
  action?: string;
  property?: Property;
  className?: string;
}) {
  const { openEnquiry } = useEnquiry();
  return (
    <button className={className} onClick={() => openEnquiry(action, property)}>
      {children}
    </button>
  );
}
/** crypto.randomUUID only exists on HTTPS or localhost, so fall back when opened over the local network. */
function newSubmissionKey() {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
export function EnquiryForm({
  action = "General Enquiry",
  property,
  onSuccess,
}: {
  action?: string;
  property?: Property;
  onSuccess?: () => void;
}) {
  const { categories } = useEnquiry();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [key] = useState(newSubmissionKey);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      contactTime: "",
      consent: false,
      website: "",
      type: action as EnquiryInput["type"],
      category: property?.category || categories[0] || "Residential",
    },
  });
  async function submit(data: EnquiryInput) {
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({
          ...data,
          propertyId: property?.id,
          propertyTitle: property?.title,
          propertyCategory: property?.category,
          propertyUrl: property
            ? `${window.location.origin}/property/${property.slug}`
            : undefined,
          source: window.location.pathname,
          action,
        }),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(
          result.error || "Your enquiry could not be saved. Please try again.",
        );
      setDone(true);
      onSuccess?.();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to connect. Please try again.",
      );
    }
  }
  if (done && !onSuccess)
    return (
      <div className="form-success" role="status">
        <Check />
        <h3>Your enquiry has been received.</h3>
        <p>Thank you. Our team will be in touch.</p>
      </div>
    );
  return (
    <form className="enquiry-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        <label>
          Full name <span>*</span>
          <input
            {...register("name")}
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <small role="alert">{errors.name.message}</small>}
        </label>
        <label>
          Mobile number <span>*</span>
          <div className="phone-input">
            <span>+91</span>
            <input
              {...register("phone")}
              placeholder="Mobile number"
              autoComplete="tel-national"
              type="tel"
              aria-invalid={!!errors.phone}
            />
          </div>
          {errors.phone && <small role="alert">{errors.phone.message}</small>}
        </label>
        <label>
          Email address
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <small role="alert">{errors.email.message}</small>}
        </label>
        <label>
          Preferred contact time
          <select {...register("contactTime")}>
            <option value="">Any time</option>
            <option>Morning · 10 AM – 12 PM</option>
            <option>Afternoon · 12 PM – 4 PM</option>
            <option>Evening · 4 PM – 7 PM</option>
          </select>
        </label>
        <label>
          Property category
          <select {...register("category")}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Enquiry type
          <select {...register("type")}>
            <option>{action}</option>
            {[
              "Buy Property",
              "Sell Property",
              "Property Consultation",
              "Investment Enquiry",
              "General Enquiry",
            ]
              .filter((x) => x !== action)
              .map((x) => (
                <option key={x}>{x}</option>
              ))}
          </select>
        </label>
      </div>
      <label>
        Your requirement
        <textarea
          {...register("message")}
          rows={3}
          placeholder="A little about what you’re looking for…"
        />
        {errors.message && <small role="alert">{errors.message.message}</small>}
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input {...register("website")} tabIndex={-1} autoComplete="off" />
      </label>
      <label className="consent">
        <input type="checkbox" {...register("consent")} />
        <span>
          I agree to be contacted by Drishyam Realty and accept the{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>
      {errors.consent && <small role="alert">{errors.consent.message}</small>}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button
        className="button button-navy form-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="spin" size={17} />
            Sending enquiry…
          </>
        ) : (
          <>
            Send Enquiry <ArrowUpRight size={17} />
          </>
        )}
      </button>
      <p className="form-reassurance">
        Your details are private. Your journey is personal.
      </p>
    </form>
  );
}
