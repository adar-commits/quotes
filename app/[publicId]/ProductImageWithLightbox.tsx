"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

type Props = {
  src: string | null;
  alt?: string;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export default function ProductImageWithLightbox({
  src,
  alt = "",
  fill,
  className,
  containerClassName,
  sizes,
  width,
  height,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    },
    []
  );

  if (!src) {
    return (
      <div
        className={`bg-slate-100/80 ${containerClassName ?? ""}`}
        style={
          width && height
            ? { width, height }
            : fill
              ? { width: "100%", height: "100%" }
              : undefined
        }
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block text-left w-full h-full min-h-[120px] ${containerClassName ?? ""}`}
        aria-label="הגדל תמונה"
      >
        <div className="relative w-full h-full overflow-hidden rounded-xl bg-slate-100/50 transition-transform hover:scale-[1.02]">
          <Image
            src={src}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            className={className ?? "object-contain"}
            sizes={sizes}
          />
        </div>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="תמונה מוגדלת"
          tabIndex={0}
        >
          <button
            type="button"
            className="absolute top-4 left-4 z-10 rounded-full bg-white/90 p-2 text-slate-800 shadow-lg transition hover:bg-white"
            onClick={() => setOpen(false)}
            aria-label="סגור"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative max-h-[90vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={900}
              className="max-h-[90vh] w-auto object-contain rounded-lg shadow-2xl"
              sizes="(max-width: 1024px) 100vw, 1024px"
              unoptimized={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
