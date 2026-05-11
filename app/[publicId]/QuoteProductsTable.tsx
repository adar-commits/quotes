"use client";

import { useMemo, useState } from "react";
import type { QuoteProductRow } from "@/lib/quotes-db";
import type { QuoteTotalsBreakdown } from "@/lib/quote-total";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

type SortKey =
  | "sort_order"
  | "sku"
  | "product_desc"
  | "qty"
  | "unit_price"
  | "line_total";

type Row = QuoteProductRow & { lineTotal: number };

export default function QuoteProductsTable({
  products,
  mainColor,
  quoteVat,
  breakdown,
}: {
  products: QuoteProductRow[];
  mainColor: string;
  quoteVat: number;
  breakdown: QuoteTotalsBreakdown;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("sort_order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const base: Row[] = products.map((p) => ({
      ...p,
      lineTotal:
        p.qty * (Number(p.unit_price) - Number(p.unit_discount)),
    }));
    const mul = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "sort_order":
          cmp = a.sort_order - b.sort_order;
          break;
        case "sku":
          cmp = (a.sku ?? "").localeCompare(b.sku ?? "", "he");
          break;
        case "product_desc":
          cmp = (a.product_desc ?? "").localeCompare(
            b.product_desc ?? "",
            "he"
          );
          break;
        case "qty":
          cmp = a.qty - b.qty;
          break;
        case "unit_price":
          cmp =
            Number(a.unit_price) - Number(b.unit_price);
          break;
        case "line_total":
          cmp = a.lineTotal - b.lineTotal;
          break;
        default:
          cmp = 0;
      }
      return cmp * mul;
    });
  }, [products, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const {
    lineSubtotal,
    specialDiscountPercent,
    specialDiscountAmount,
    vatAmount,
    total,
  } = breakdown;

  const showSpecial =
    specialDiscountPercent > 0 && specialDiscountAmount > 0;

  return (
    <>
      <div
        className="-mx-1 overflow-x-auto overscroll-x-contain border-t border-slate-200/80 px-1 pb-1 [-webkit-overflow-scrolling:touch] print:overflow-visible print:mx-0 print:px-0"
        dir="rtl"
      >
        <table className="w-max min-w-[920px] border-collapse md:w-full md:min-w-0 md:table-fixed print:w-full print:min-w-0 print:table-fixed">
          <colgroup>
            <col style={{ width: "15.6%" }} />
            <col />
            <col style={{ width: "9%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr
              className="border-b-2 border-slate-200 text-white"
              style={{ backgroundColor: mainColor }}
            >
              <th className="px-2 py-3 text-right align-bottom md:px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("sku")}
                  className="block w-full text-right text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  מק&quot;ט
                  {sortKey === "sku" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </button>
              </th>
              <th className="px-2 py-3 text-right align-bottom md:px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("product_desc")}
                  className="block w-full text-right text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  תאור מוצר
                  {sortKey === "product_desc"
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </button>
              </th>
              <th className="px-2 py-3 text-right align-bottom md:px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("qty")}
                  className="block w-full text-right text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  כמות
                  {sortKey === "qty"
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </button>
              </th>
              <th className="px-2 py-3 text-right align-bottom md:px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("unit_price")}
                  className="block w-full text-right text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  מחיר ליחידה
                  {sortKey === "unit_price"
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </button>
              </th>
              <th className="px-2 py-3 text-right align-bottom md:px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("line_total")}
                  className="block w-full text-right text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  סה&quot;כ
                  {sortKey === "line_total"
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr
                key={`${p.sort_order}-${i}`}
                className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/80" : ""}`}
              >
                <td className="max-w-[min(28vw,11rem)] px-2 py-3 text-right text-sm text-slate-700 align-top md:max-w-none md:px-3 print:max-w-none print:px-3">
                  <span className="break-all">{p.sku ?? "—"}</span>
                </td>
                <td className="min-w-[12rem] max-w-[42vw] px-2 py-3 text-right text-sm text-slate-700 align-top md:max-w-none md:px-3 print:min-w-0 print:max-w-none print:px-3">
                  <span className="break-words">{p.product_desc ?? "—"}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-right text-sm text-slate-700 align-top tabular-nums md:px-3">
                  {p.qty}
                </td>
                <td
                  className="whitespace-nowrap px-2 py-3 text-right text-sm text-slate-700 align-top tabular-nums md:px-3"
                  dir="ltr"
                >
                  {formatCurrency(Number(p.unit_price))}
                </td>
                <td
                  className="whitespace-nowrap px-2 py-3 text-right text-sm font-semibold text-slate-800 align-top tabular-nums md:px-3"
                  dir="ltr"
                >
                  {formatCurrency(p.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className="relative flex flex-col items-center justify-center gap-0 px-4 py-5 text-white md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-4 md:px-8 print:flex-row print:flex-wrap print:items-start print:justify-between print:gap-4 print:px-6 print:py-4"
        style={{
          background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}dd 100%)`,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.1)",
        }}
        dir="rtl"
      >
        {/* Mobile: center stack; סה״כ לתשלום last. Desktop: row remains readable */}
        <div className="flex w-full max-w-md flex-col items-center gap-3 text-center md:max-w-none md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-8 md:text-right print:max-w-none print:flex-row print:flex-wrap print:items-start print:justify-between print:gap-6 print:text-right">
          <div className="md:text-right print:text-right">
            <p className="text-xs font-medium opacity-90 sm:text-sm">
              סה&quot;כ ללא מע&quot;מ
            </p>
            <p className="text-sm font-bold tabular-nums sm:text-base">
              {formatCurrency(lineSubtotal)}
            </p>
          </div>
          {showSpecial && (
            <div className="md:text-right print:text-right">
              <p className="text-xs font-medium opacity-90 sm:text-sm">
                הנחה מיוחדת ({specialDiscountPercent}%)
              </p>
              <p className="text-sm font-bold tabular-nums sm:text-base">
                {formatCurrency(specialDiscountAmount)}
              </p>
            </div>
          )}
          <div className="md:text-right print:text-right">
            <p className="text-xs font-medium opacity-90 sm:text-sm">
              מע&quot;מ ({quoteVat}%)
            </p>
            <p className="text-sm font-bold tabular-nums sm:text-base">
              {formatCurrency(vatAmount)}
            </p>
          </div>
          <div className="mt-1 w-full border-t border-white/25 pt-3 md:mt-0 md:w-auto md:border-t-0 md:pt-0 print:mt-0 print:w-auto print:border-t-0 print:pt-0">
            <p className="text-xs font-medium opacity-90 sm:text-sm">
              סה&quot;כ לתשלום
            </p>
            <p className="text-base font-bold tabular-nums sm:text-lg md:text-xl">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
