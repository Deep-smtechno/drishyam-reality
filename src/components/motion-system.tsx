"use client";
import { useEffect, useLayoutEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
// Elements that rise into place as they scroll into view, in the same spirit as the hero text.
const RISE =
  "main h2, main .about2-copy > :not(h2), main .about2-points li, main .routes-copy > div, main .process-step, main .review-lead, main .review-item, main .reviews-filter, main .heading-row p, main .property-section-bar, main .property-card, main .final-cta p, main .cta-buttons, main .listing-topbar, main .contact-item";
const MEDIA =
  "main .about2-main, main .about2-inset, main .routes-photo, main .property-card .property-image";
function useScrollReveal(path: string, reduced: boolean | null) {
  useLayoutEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.classList.add("rv-in");
          const done =
            1700 + parseFloat(el.style.getPropertyValue("--rv-d") || "0");
          timers.push(
            window.setTimeout(() => {
              el.classList.remove("rv", "rv-in", "rv-media");
              el.style.removeProperty("--rv-d");
            }, done),
          );
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    // Only touch elements React has already hydrated, otherwise the server and client
    // markup would disagree. Anything not hydrated yet is retried shortly after.
    const hydrated = (el: Element) =>
      Object.keys(el).some((k) => k.startsWith("__reactFiber"));
    let attempts = 0;
    let retry = 0;
    const prepare = (selector: string, media: boolean) => {
      let pending = false;
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (seen.has(el) || el.closest(".hero2")) return;
        // Anything already on screen stays as it is, so nothing flashes on load.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        if (!hydrated(el)) {
          pending = true;
          return;
        }
        seen.add(el);
        const siblings = Array.from(el.parentElement?.children ?? []).filter(
          (n) => n.matches(selector),
        );
        const index = Math.max(siblings.indexOf(el), 0);
        el.style.setProperty("--rv-d", `${Math.min(index, 5) * 90}ms`);
        el.classList.add("rv");
        if (media) el.classList.add("rv-media");
        io.observe(el);
      });
      return pending;
    };
    const run = () => {
      const a = prepare(RISE, false);
      const b = prepare(MEDIA, true);
      if ((a || b) && attempts++ < 30) retry = window.setTimeout(run, 150);
    };
    run();
    return () => {
      io.disconnect();
      window.clearTimeout(retry);
      timers.forEach(window.clearTimeout);
    };
  }, [path, reduced]);
}
export function MotionSystem() {
  const path = usePathname();
  const reduced = useReducedMotion();
  useScrollReveal(path, reduced);
  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {});
    let frame1 = 0,
      frame2 = 0;
    const start = () => {
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
          ctx.add(() => {
            gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) =>
              gsap.to(el, {
                yPercent: 5,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              }),
            );
          });
        });
      });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      ctx.revert();
    };
  }, [path, reduced]);
  useEffect(() => {
    if (
      reduced ||
      !window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches
    )
      return;
    let cancelled = false;
    let stop: (() => void) | undefined;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        autoRaf: false,
        anchors: true,
        allowNestedScroll: true,
        duration: 1.05,
      });
      const frame = (seconds: number) => lenis.raf(seconds * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(frame);
      stop = () => {
        gsap.ticker.remove(frame);
        lenis.destroy();
      };
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [reduced]);
  return null;
}
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={path}
      className="page-transition"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}
