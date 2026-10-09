"use client";
import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Images, X, ChevronLeft, ChevronRight, Maximize } from "lucide-react";
export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  function next() {
    setIndex((i) => (i + 1) % images.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }
  return (
    <>
      <div className="detail-gallery">
        <button
          className="gallery-main"
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
          aria-label="Open property gallery"
        >
          <Image
            src={images[0] || "/images/hero.jpg"}
            alt={`${title} main view`}
            fill
            unoptimized={images[0]?.startsWith("https://")}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 650px) 90vw, 60vw"
          />
          <span className="gallery-view">
            <Maximize size={14} />
            View Gallery
          </span>
        </button>
        <div className="gallery-side">
          {images.slice(1, 3).map((url, i) => (
            <button
              key={`${url}${i}`}
              onClick={() => {
                setIndex(i + 1);
                setOpen(true);
              }}
              aria-label={`View image ${i + 2}`}
            >
              <Image
                src={url}
                alt={`${title} view ${i + 2}`}
                fill
                unoptimized={url.startsWith("https://")}
                sizes="30vw"
              />
            </button>
          ))}
          {images.length < 2 && (
            <span className="gallery-quiet">
              A new perspective
              <br />
              on better living.
            </span>
          )}
        </div>
        <button
          className="gallery-count button button-light"
          onClick={() => setOpen(true)}
        >
          <Images size={15} />
          {images.length} Photos
        </button>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="gallery-overlay" />
          <Dialog.Content
            className="gallery-modal"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") next();
              if (e.key === "ArrowLeft") prev();
            }}
          >
            <Dialog.Title className="gallery-title">
              {title}{" "}
              <span>
                {index + 1} / {images.length}
              </span>
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Use left and right arrows to browse the property images. Press
              Escape to close.
            </Dialog.Description>
            <Dialog.Close
              className="gallery-close icon-button"
              aria-label="Close gallery"
            >
              <X />
            </Dialog.Close>
            <div className="fullscreen-image">
              <Image
                src={images[index] || "/images/hero.jpg"}
                alt={`${title} view ${index + 1}`}
                fill
                unoptimized={images[index]?.startsWith("https://")}
                sizes="100vw"
                style={{ objectFit: "contain" }}
              />
            </div>
            {images.length > 1 && (
              <>
                <button
                  className="gallery-prev icon-button"
                  onClick={prev}
                  aria-label="Previous image"
                >
                  <ChevronLeft />
                </button>
                <button
                  className="gallery-next icon-button"
                  onClick={next}
                  aria-label="Next image"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
