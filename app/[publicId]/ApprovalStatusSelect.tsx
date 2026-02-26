"use client";

import { useState, useRef, useEffect } from "react";

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
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (value: StatusValue) => {
    setSelected(value);
    setOpen(false);
    if (value !== "approved") return;

    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quotePublicId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSortOrder, status: "approved" }),
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

  const displayLabel = selected
    ? OPTIONS.find((o) => o.value === selected)?.label ?? "סטטוס אישור"
    : "סטטוס אישור";

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <span
        className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500"
        style={{ color: BRAND_RED }}
      >
        סטטוס אישור
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={saving}
          className="flex w-full min-w-[140px] items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-medium text-slate-800 transition-all hover:border-slate-300 disabled:opacity-70"
          style={{
            borderColor: selected ? BRAND_RED : undefined,
            backgroundColor: selected ? `${BRAND_RED}10` : undefined,
          }}
        >
          <span>{displayLabel}</span>
          {saving ? (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[#801a1e]" />
          ) : (
            <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        {open && (
          <ul
            className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            role="listbox"
          >
            {OPTIONS.map(({ value, label }) => (
              <li key={value} role="option">
                <button
                  type="button"
                  onClick={() => handleSelect(value)}
                  className="w-full px-3 py-2 text-right text-sm transition-colors hover:bg-slate-100"
                  style={{
                    color: selected === value ? BRAND_RED : undefined,
                    fontWeight: selected === value ? 600 : undefined,
                  }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
