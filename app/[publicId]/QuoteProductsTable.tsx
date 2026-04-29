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
      <div className="overflow-x-auto border-t border-slate-200/80">
        <table className="w-full min-w-[500px] border-collapse text-right">
          <thead>
            <tr
              className="border-b-2 border-slate-200 text-white"
              style={{ backgroundColor: mainColor }}
            >
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("sku")}
                  className="w-full text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  מק&quot;ט
                  {sortKey === "sku" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("product_desc")}
                  className="w-full text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  תאור מוצר
                  {sortKey === "product_desc"
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("qty")}
                  className="w-full text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  כמות
                  {sortKey === "qty"
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("unit_price")}
                  className="w-full text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
                >
                  מחיר ליחידה
                  {sortKey === "unit_price"
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => toggleSort("line_total")}
                  className="w-full text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
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
                <td className="py-3 px-3 text-sm text-slate-700">
                  {p.sku ?? "—"}
                </td>
                <td className="py-3 px-3 text-sm text-slate-700">
                  {p.product_desc ?? "—"}
                </td>
                <td className="py-3 px-3 text-sm text-slate-700">{p.qty}</td>
                <td className="py-3 px-3 text-sm text-slate-700" dir="ltr">
                  {formatCurrency(Number(p.unit_price))}
                </td>
                <td
                  className="py-3 px-3 text-sm font-semibold text-slate-800"
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
        className="relative flex flex-col gap-6 px-4 py-6 text-white sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 md:px-8"
        style={{
          background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}dd 100%)`,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.1)",
        }}
        dir="ltr"
      >
        {/* Visual LTR left → right: סה״כ לתשלום | מע״מ | הנחה (opt) | סה״כ ללא מע״מ */}
        <div className="flex flex-col gap-4 text-right sm:flex-row sm:flex-wrap sm:gap-8 md:gap-12">
          <div className="text-right">
            <p className="text-sm font-medium opacity-90">סה&quot;כ לתשלום</p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium opacity-90">
              מע&quot;מ ({quoteVat}%)
            </p>
            <p className="text-base font-bold sm:text-lg">
              {formatCurrency(vatAmount)}
            </p>
          </div>
          {showSpecial && (
            <div className="text-right">
              <p className="text-sm font-medium opacity-90">
                הנחה מיוחדת ({specialDiscountPercent}%)
              </p>
              <p className="text-base font-bold sm:text-lg">
                {formatCurrency(specialDiscountAmount)}
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm font-medium opacity-90">
              סה&quot;כ ללא מע&quot;מ
            </p>
            <p className="text-base font-bold sm:text-lg">
              {formatCurrency(lineSubtotal)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
