"use client";

import { useEffect, useState } from "react";

export default function PrintButton({ mainColor }: { mainColor?: string | null }) {
  const color = mainColor || "#801a1e";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-black/10 transition-all hover:scale-[1.02] active:scale-95 print:hidden"
      style={{
        backgroundColor: color,
        WebkitTapHighlightColor: "transparent",
        boxShadow: `0 6px 20px ${color}55`,
      }}
      aria-label="הורדה כ-PDF"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 16V4"
        />
      </svg>
      <span>הורד / הדפס PDF</span>
    </button>
  );
}
