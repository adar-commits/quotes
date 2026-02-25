"use client";

import { useEffect, useState } from "react";
import { Noto_Sans_Hebrew } from "next/font/google";

const noto = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export default function QuoteReveal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`relative min-h-screen ${noto.className}`} dir="rtl">
      {/* Shimmer skeleton — visible for 2s then fades out */}
      <div
        className={`absolute inset-0 z-10 bg-gray-50 transition-opacity duration-500 ${
          showContent ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={showContent}
      >
        <div className="mx-auto max-w-5xl p-4 py-6 md:p-8">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="h-32 bg-gray-200 sm:h-40 md:h-52">
              <div className="skeleton-shimmer h-full w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 border-t border-gray-200 bg-white/90 p-4 backdrop-blur-sm sm:gap-6 md:grid-cols-3 md:p-8">
              <div className="space-y-2">
                <div className="skeleton-shimmer h-3 w-20 rounded" />
                <div className="skeleton-shimmer h-5 w-32 rounded" />
              </div>
              <div className="space-y-2">
                <div className="skeleton-shimmer h-3 w-24 rounded" />
                <div className="skeleton-shimmer h-4 w-28 rounded" />
                <div className="skeleton-shimmer h-3 w-24 rounded mt-2" />
                <div className="skeleton-shimmer h-4 w-32 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="skeleton-shimmer h-20 w-20 shrink-0 rounded-full" />
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-28 rounded" />
                  <div className="skeleton-shimmer h-3 w-24 rounded" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 md:px-8">
              <div className="space-y-4 md:hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                    <div className="skeleton-shimmer h-24 w-20 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-shimmer h-3 w-16 rounded" />
                      <div className="skeleton-shimmer h-4 w-full rounded" />
                      <div className="skeleton-shimmer h-3 w-24 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block">
                <div className="flex gap-4 border-b-2 border-gray-200 py-3">
                  <div className="skeleton-shimmer h-4 w-16 rounded" />
                  <div className="skeleton-shimmer h-4 w-40 rounded flex-1" />
                  <div className="skeleton-shimmer h-4 w-12 rounded" />
                  <div className="skeleton-shimmer h-4 w-16 rounded" />
                  <div className="skeleton-shimmer h-4 w-16 rounded" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 border-b border-gray-100 py-4">
                    <div className="skeleton-shimmer h-10 w-16 rounded" />
                    <div className="skeleton-shimmer h-24 w-32 rounded flex-shrink-0" />
                    <div className="skeleton-shimmer h-4 w-full max-w-xs rounded flex-1" />
                    <div className="skeleton-shimmer h-4 w-12 rounded" />
                    <div className="skeleton-shimmer h-4 w-16 rounded" />
                    <div className="skeleton-shimmer h-4 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="skeleton-shimmer flex gap-4 rounded-b-xl bg-gray-300 px-4 py-6 md:px-8">
              <div className="h-6 w-24 rounded" />
              <div className="h-6 w-24 rounded" />
              <div className="h-6 w-28 rounded" />
            </div>
            <div className="border-t border-gray-100 p-4 md:p-8">
              <div className="skeleton-shimmer mb-3 h-5 w-40 rounded" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-4 w-full max-w-md rounded" />
                <div className="skeleton-shimmer h-4 w-full max-w-sm rounded" />
                <div className="skeleton-shimmer h-4 w-full max-w-md rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actual quote content — fades in after 2s */}
      <div
        className={`transition-opacity duration-500 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
