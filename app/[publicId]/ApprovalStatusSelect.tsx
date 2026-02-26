"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const DEFAULT_MAIN = "#801a1e";

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
  mainColor?: string | null;
};

export default function ApprovalStatusSelect({
  quotePublicId,
  productSortOrder,
  initialStatus = null,
  mainColor,
}: Props) {
  const brandColor = mainColor || DEFAULT_MAIN;
  const [selected, setSelected] = useState<StatusValue | null>(
    (initialStatus as StatusValue) ?? null
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; w: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !btnRef.current) {
      setDropdownRect(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    setDropdownRect({
      top: r.top - 4,
      left: r.left,
      w: Math.max(r.width, 100),
    });
  }, [open]);

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
    ? OPTIONS.find((o) => o.value === selected)?.label ?? "סטטוס"
    : "סטטוס";

  const dropdownList = open && dropdownRect && typeof document !== "undefined" && createPortal(
    <ul
      ref={(el) => { dropdownRef.current = el; }}
      className="fixed z-[9999] rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
      role="listbox"
      style={{
        bottom: window.innerHeight - dropdownRect.top + 4,
        left: dropdownRect.left,
        width: dropdownRect.w,
        maxWidth: 120,
      }}
    >
      {OPTIONS.map(({ value, label }) => (
        <li key={value} role="option">
          <button
            type="button"
            onClick={() => handleSelect(value)}
            className="w-full px-2 py-1.5 text-right text-xs transition-colors hover:bg-slate-100"
        style={{
          color: selected === value ? brandColor : undefined,
              fontWeight: selected === value ? 600 : undefined,
            }}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>,
    document.body
  );

  return (
    <div className="flex flex-col gap-1 w-full max-w-[100px]" ref={ref}>
      <span
        className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500"
        style={{ color: brandColor }}
      >
        סטטוס אישור
      </span>
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(!open)}
          disabled={saving}
          className="flex w-full max-w-[100px] items-center justify-between gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-xs font-medium text-slate-800 transition-all hover:border-slate-300 disabled:opacity-70"
    style={{
        borderColor: selected ? brandColor : undefined,
        backgroundColor: selected ? `${brandColor}10` : undefined,
      }}
        >
          <span className="truncate">{displayLabel}</span>
          {saving ? (
            <span className="inline-block h-2.5 w-2.5 shrink-0 animate-spin rounded-full border-2 border-slate-300" style={{ borderTopColor: brandColor }} />
          ) : (
            <svg className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      {dropdownList}
    </div>
  );
}
