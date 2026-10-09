"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Brand } from "./brand";
import { useEnquiry } from "./enquiry";
import { MotionSystem, PageTransition } from "./motion-system";
import type { Settings } from "@/lib/types";
const links = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Buy Properties", "/buy-properties"],
  ["Sell Properties", "/sell-properties"],
  ["Testimonials", "/testimonials"],
  ["Contact", "/contact"],
];
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openEnquiry } = useEnquiry();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => setOpen(false), [path]);
  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, url]) => (
            <Link
              key={url}
              href={url}
              className={path === url ? "active" : ""}
              aria-current={path === url ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="button button-navy header-cta"
          onClick={() => openEnquiry("Property Consultation")}
        >
          Let’s Talk <ArrowUpRight size={17} />
        </button>
        <button
          className="icon-button mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([label, url]) => (
            <Link href={url} key={url}>
              {label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
          <button
            className="button button-navy"
            onClick={() => {
              setOpen(false);
              openEnquiry("Property Consultation");
            }}
          >
            Let’s Talk
          </button>
        </nav>
      )}
    </header>
  );
}
export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer>
      <div className="footer-top container">
        <div className="footer-brand">
          <Brand />
          <p>
            Thoughtful property choices.
            <br />
            Professional guidance. Since 2019.
          </p>
          <span className="eyebrow">MAKING YOUR VISUALIZATION REAL</span>
        </div>
        <div>
          <h3>Explore</h3>
          {links.slice(1, 5).map(([name, url]) => (
            <Link key={url} href={url}>
              {name}
            </Link>
          ))}
        </div>
        <div>
          <h3>How can we help?</h3>
          <Link href="/buy-properties">Find a property</Link>
          <Link href="/sell-properties">Sell your property</Link>
          <Link href="/contact">Property consultation</Link>
          <Link href="/contact">Investment guidance</Link>
        </div>
        <div>
          <h3>Let’s connect</h3>
          <p>
            <MapPin size={16} />
            {settings.address}
          </p>
          <p>
            <Mail size={16} />
            {settings.email}
          </p>
          {settings.phone && (
            <a href={`tel:${settings.phone}`}>{settings.phone}</a>
          )}
          {settings.demo && (
            <span className="small-note">Temporary contact details</span>
          )}
          <Link href="/contact" className="text-link">
            Get in touch <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>
          © {new Date().getFullYear()} Drishyam Realty. All rights reserved.
        </span>
        <div>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms & Conditions</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
/** Public site chrome. The administrator workspace renders on its own, without header or footer. */
export function SiteChrome({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  const path = usePathname();
  if (path === "/admin" || path.startsWith("/admin/"))
    return <main id="main">{children}</main>;
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer settings={settings} />
      <MotionSystem />
    </>
  );
}
