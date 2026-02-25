import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heebo } from "next/font/google";
import { getQuoteByPublicId } from "@/lib/quotes-db";
import QuoteSignature from "./QuoteSignature";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const BRAND_RED = "#801a1e";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function shortenId(id: string | null): string {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const data = await getQuoteByPublicId(publicId);
  if (!data) notFound();

  const { quote, customer, representative, products, paymentTerms } = data;

  const subtotal = products.reduce(
    (sum, p) => sum + p.qty * (Number(p.unit_price) - Number(p.unit_discount)),
    0
  );
  const afterDiscount = subtotal - Number(quote.special_discount);
  const vatRate = Number(quote.vat) / 100;
  const vatAmount = afterDiscount * vatRate;
  const total = afterDiscount + vatAmount;

  return (
    <div
      className={`min-h-screen bg-gray-50 antialiased ${heebo.className}`}
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl p-4 py-8 md:p-8">
        {/* Main card: digital paper with glassmorphism feel */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Section 1: Hero banner + 3-column info header */}
          <div className="border-b border-gray-100">
            <div className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 md:h-52" />
            <div className="grid grid-cols-1 gap-6 border-t border-gray-200 bg-white/95 p-6 backdrop-blur-sm md:grid-cols-3 md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  שם לקוח
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {customer?.customer_name ?? "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  מס׳ הצעה
                </p>
                <p className="text-slate-800">{shortenId(quote.invoice_id ?? quote.quotation_id)}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-2">
                  תאריך הפקה
                </p>
                <p className="text-slate-800">{formatDate(quote.invoice_creation_date)}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-2">
                  שם הפרויקט
                </p>
                <p className="text-slate-800">{quote.project_name ?? "—"}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 shadow-md">
                  {representative?.rep_avatar ? (
                    <Image
                      src={representative.rep_avatar}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-2xl font-medium text-slate-600">
                      {representative?.rep_full_name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {representative?.rep_full_name ?? "—"}
                  </p>
                  {representative?.rep_phone && (
                    <a
                      href={`tel:${representative.rep_phone.replace(/\D/g, "")}`}
                      className="mt-1 block text-sm text-gray-600 transition-colors hover:text-[#801a1e]"
                    >
                      {representative.rep_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Products table — borderless sides, thick top/bottom */}
          <section className="px-4 py-6 md:px-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-right">
                <thead>
                  <tr className="border-y-2 border-gray-300 bg-gray-50/80">
                    <th className="py-4 px-3 text-sm font-bold text-gray-600">
                      מק&quot;ט
                    </th>
                    <th className="py-4 px-3 text-sm font-bold text-gray-600">
                      תאור מוצר
                    </th>
                    <th className="py-4 px-3 text-sm font-bold text-gray-600">
                      כמות
                    </th>
                    <th className="py-4 px-3 text-sm font-bold text-gray-600">
                      מחיר ליח׳
                    </th>
                    <th className="py-4 px-3 text-sm font-bold text-gray-600">
                      סה&quot;כ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => {
                    const lineTotal =
                      p.qty *
                      (Number(p.unit_price) - Number(p.unit_discount));
                    return (
                      <tr
                        key={i}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50/80"
                      >
                        <td className="py-4 px-3 text-sm font-medium text-slate-800">
                          {p.sku ?? "—"}
                        </td>
                        <td className="py-4 px-3 align-top">
                          <div className="flex flex-col gap-2">
                            {p.picture_url && (
                              <div className="relative h-40 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-transform hover:scale-105">
                                <Image
                                  src={p.picture_url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="128px"
                                />
                              </div>
                            )}
                            <p className="font-medium text-slate-800">
                              {p.product_desc ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-gray-700">{p.qty}</td>
                        <td className="py-4 px-3 text-gray-700">
                          {formatCurrency(Number(p.unit_price))}
                        </td>
                        <td className="py-4 px-3 font-semibold text-slate-800">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Financial summary footer — full-width brand bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-4 rounded-b-xl px-6 py-6 text-white md:px-8"
            style={{ backgroundColor: BRAND_RED }}
          >
            <div className="flex flex-wrap gap-8 md:gap-12">
              <div>
                <p className="text-sm opacity-90">סה&quot;כ ללא מע&quot;מ</p>
                <p className="text-lg font-semibold">{formatCurrency(subtotal)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">מע&quot;מ ({quote.vat}%)</p>
                <p className="text-lg font-semibold">{formatCurrency(vatAmount)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">סה&quot;כ לתשלום</p>
                <p className="text-xl font-bold">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Terms & conditions */}
          <div className="border-t border-gray-100 p-6 md:p-8">
            <h3
              className="mb-4 text-lg font-bold"
              style={{ color: BRAND_RED }}
            >
              תנאי תשלום ומסחר
            </h3>
            {paymentTerms.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-700">
                {paymentTerms.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-800"
                      aria-hidden
                    />
                    <span>{t.term}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">אין תנאים להצגה.</p>
            )}
          </div>

          {/* Section 5: Digital signature (interactive) */}
          {quote.require_signature && (
            <div className="border-t border-gray-100 p-6 md:p-8">
              <QuoteSignature />
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>כנרת 10, איירפורט סיטי</p>
          <Link
            href="/"
            className="mt-1 inline-block text-gray-600 transition-colors hover:text-[#801a1e]"
          >
            csquotes.vercel.app
          </Link>
        </footer>
      </div>
    </div>
  );
}
