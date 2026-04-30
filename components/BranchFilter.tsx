"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type BranchOption = { id: string; label: string };

export const DEFAULT_BRANCHES: BranchOption[] = [
  { id: "airport_city", label: "איירפורט סיטי" },
  { id: "bnei_brak", label: "בני ברק" },
  { id: "yarka", label: "ירכא" },
  { id: "netanya", label: "נתניה" },
  { id: "segula_pt", label: 'סגולה פ"ת' },
  { id: "phone_sales", label: "עסקאות טלפוניות" },
  { id: "kiryat_ata", label: "קרית אתא" },
];

type Props = {
  branches?: BranchOption[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
};

/**
 * High-contrast branch multi-select: always light panel + dark text
 * (avoids dark popover + dark text from parent `dark` / theme).
 */
export default function BranchFilter({
  branches = DEFAULT_BRANCHES,
  defaultSelectedIds,
  onSelectionChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (defaultSelectedIds?.length) return new Set(defaultSelectedIds);
    return new Set(branches.map((b) => b.id));
  });
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => b.label.toLowerCase().includes(q));
  }, [branches, search]);

  const notify = useCallback(
    (next: Set<string>) => {
      onSelectionChange?.(Array.from(next));
    },
    [onSelectionChange]
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      notify(n);
      return n;
    });
  };

  const selectAll = () => {
    const n = new Set(branches.map((b) => b.id));
    setSelected(n);
    notify(n);
  };

  const clearAll = () => {
    const n = new Set<string>();
    setSelected(n);
    notify(n);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const summaryLabel = useMemo(() => {
    if (selected.size === 0) return "ללא סניף";
    if (selected.size === branches.length) return "כל הסניפים";
    if (selected.size === 1) {
      const id = [...selected][0];
      return branches.find((b) => b.id === id)?.label ?? "סניף אחד";
    }
    return `${selected.size} סניפים`;
  }, [selected, branches]);

  return (
    <div className={`relative ${className}`} ref={rootRef} dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex min-h-[44px] w-full min-w-[12rem] items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 dark:bg-white dark:text-slate-900"
      >
        <span className="truncate">{summaryLabel}</span>
        <span className="text-slate-500" aria-hidden>
          ▼
        </span>
      </button>

      {open && (
        <div
          className="absolute end-0 top-full z-[100] mt-2 w-[min(100vw-2rem,20rem)] rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl ring-1 ring-slate-900/10 dark:bg-white dark:text-slate-900"
          role="listbox"
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש סניף…"
            className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            dir="rtl"
            autoComplete="off"
          />

          <div className="mb-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
            >
              בחר הכל
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              נקה בחירה
            </button>
          </div>

          <ul className="max-h-60 space-y-0.5 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-sm text-slate-500">
                אין תוצאות
              </li>
            ) : (
              filtered.map((b) => (
                <li key={b.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-right transition hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={selected.has(b.id)}
                      onChange={() => toggle(b.id)}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="min-w-0 flex-1 text-sm font-normal leading-snug text-slate-900">
                      {b.label}
                    </span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
