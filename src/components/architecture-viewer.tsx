"use client";
import Image from "next/image";
import { useRef } from "react";
/** The photo tilts and drifts gently as the pointer moves over it. */
export function ArchitectureViewer() {
  const box = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = box.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--tx", `${(-x * 22).toFixed(1)}px`);
    el.style.setProperty("--ty", `${(-y * 14).toFixed(1)}px`);
  }
  function reset() {
    const el = box.current;
    if (!el) return;
    for (const v of ["--rx", "--ry", "--tx", "--ty"])
      el.style.removeProperty(v);
  }
  return (
    <div
      className="architecture-viewer"
      ref={box}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <div className="architecture-stage">
        <Image
          src="/images/hero.jpg"
          alt="Luxury villa architectural visualization"
          fill
          sizes="(max-width: 900px) 90vw, 55vw"
        />
      </div>
      <span>Architectural vision · Illustrative composition</span>
    </div>
  );
}
