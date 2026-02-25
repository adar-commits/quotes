"use client";

import { useState } from "react";

const BRAND_RED = "#801a1e";

const OPTIONS = [
  { value: "approved", label: "מאושר" },
  { value: "alternative", label: "נדרש חלופי" },
  { value: "rejected", label: "לא מאושר" },
] as const;

type StatusValue = (typeof OPTIONS)[number]["value"];

export default function ApprovalStatusSelect() {
  const [selected, setSelected] = useState<StatusValue | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-xs font-bold uppercase tracking-wider text-gray-500"
        style={{ color: BRAND_RED }}
      >
        סטטוס אישור
      </span>
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map(({ value, label }) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              style={{
                borderColor: isActive ? BRAND_RED : "rgb(209 213 219)",
                backgroundColor: isActive ? BRAND_RED : "transparent",
                color: isActive ? "white" : "rgb(55 65 81)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
