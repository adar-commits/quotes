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
    <div className="flex flex-col gap-2">
      <span
        className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500"
        style={{ color: BRAND_RED }}
      >
        סטטוס אישור
      </span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ value, label }) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className="rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 hover:shadow-md active:scale-[0.98]"
              style={{
                borderColor: isActive ? BRAND_RED : "rgb(226 232 240)",
                backgroundColor: isActive ? BRAND_RED : "rgb(248 250 252)",
                color: isActive ? "white" : "rgb(51 65 85)",
                boxShadow: isActive ? "0 2px 8px rgba(128, 26, 30, 0.25)" : "none",
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
