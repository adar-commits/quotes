"use client";

import { useState } from "react";

const BRAND_RED = "#801a1e";

const OPTIONS = [
  { value: "approved", label: "מאושר" },
  { value: "alternative", label: "נדרש חלופי" },
  { value: "rejected", label: "לא מאושר" },
] as const;

type StatusValue = (typeof OPTIONS)[number]["value"];

type Props = {
  quotePublicId: string;
  productSortOrder: number;
  initialStatus?: string | null;
};

export default function ApprovalStatusSelect({
  quotePublicId,
  productSortOrder,
  initialStatus = null,
}: Props) {
  const [selected, setSelected] = useState<StatusValue | null>(
    (initialStatus as StatusValue) ?? null
  );
  const [saving, setSaving] = useState(false);

  const handleSelect = async (value: StatusValue) => {
    setSelected(value);
    if (value !== "approved") return;

    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quotePublicId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSortOrder,
          status: "approved",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
    } catch (e) {
      setSelected(null);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500"
        style={{ color: BRAND_RED }}
      >
        סטטוס אישור
      </span>
      <div className="flex flex-wrap gap-2 items-center">
        {saving && (
          <span className="text-xs text-slate-500 flex items-center gap-1" aria-live="polite">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[#801a1e]" />
            נשמר...
          </span>
        )}
        {OPTIONS.map(({ value, label }) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              disabled={saving}
              className="rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
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
