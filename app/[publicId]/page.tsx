import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getQuoteByPublicId } from "@/lib/quotes-db";
import QuoteSignature from "./QuoteSignature";
import QuoteReveal from "./QuoteReveal";
import QuoteBanner from "./QuoteBanner";
import DefaultAvatar from "./DefaultAvatar";

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

/** 5–7 product attribute labels + values (fictive when missing). */
function getProductAttributes(p: {
  color?: string | null;
  shape?: string | null;
  material?: string | null;
  technique?: string | null;
}) {
  return [
    { label: "צבע", value: p.color ?? "שנהב" },
    { label: "צורה", value: p.shape ?? "מלבן" },
    { label: "חומר", value: p.material ?? "כותנה" },
    { label: "טכניקת אריגה", value: p.technique ?? "אריגה" },
    { label: "גודל", value: "170×120 ס״מ" },
    { label: "משקל", value: "2.5 ק״ג" },
    { label: "מוצא", value: "ישראל" },
  ];
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
    <QuoteReveal>
      {/* Carpet-style background + frosted glass container */}
      <div className="min-h-screen antialiased" dir="rtl">
        {/* Carpet-oriented background with slight blur layer */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1600166898405-da9535204843?w=1920)",
          }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-amber-100/85 via-rose-50/80 to-stone-200/85 backdrop-blur-[2px]" aria-hidden />
        <div className="mx-auto max-w-5xl p-4 py-6 md:p-8 md:py-8">
          <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/85 shadow-2xl backdrop-blur-xl">
            {/* Section 1: Top banner + 3-column info header */}
            <div className="border-b border-gray-100/80">
              <QuoteBanner />
            <div className="grid grid-cols-1 gap-6 border-t border-gray-200/80 bg-white/70 p-4 backdrop-blur-md sm:p-6 md:grid-cols-3 md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  שם לקוח
                </p>
                <p className="mt-1 text-base font-semibold text-slate-800 sm:text-lg">
                  {customer?.customer_name ?? "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  מס׳ הצעה
                </p>
                <p className="text-base text-slate-800 sm:text-lg">{shortenId(quote.invoice_id ?? quote.quotation_id)}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  תאריך הפקה
                </p>
                <p className="text-slate-800">{formatDate(quote.invoice_creation_date)}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  שם הפרויקט
                </p>
                <p className="text-slate-800">{quote.project_name ?? "—"}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/50 shadow-lg sm:h-24 sm:w-24">
                  {representative?.rep_avatar ? (
                    <Image
                      src={representative.rep_avatar}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <DefaultAvatar />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {representative?.rep_full_name ?? "—"}
                  </p>
                  {representative?.rep_phone && (
                    <a
                      href={`tel:${representative.rep_phone.replace(/\D/g, "")}`}
                      className="mt-1 block min-h-[44px] min-w-[44px] py-2 text-base text-gray-600 transition-colors hover:text-[#801a1e] sm:min-h-0 sm:min-w-0 sm:py-0 sm:text-sm"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {representative.rep_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Products — cards on mobile, table from md up */}
          <section className="px-4 py-6 md:px-8">
            {/* Mobile: card list with product image + characteristics */}
            <ul className="space-y-4 md:hidden">
              {products.map((p, i) => {
                const lineTotal =
                  p.qty * (Number(p.unit_price) - Number(p.unit_discount));
                return (
                  <li
                    key={i}
                    className="rounded-xl border border-gray-200/80 bg-white/60 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex gap-4">
                      {p.picture_url ? (
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          <Image
                            src={p.picture_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      ) : (
                        <div className="h-28 w-24 shrink-0 rounded-lg border border-gray-200 bg-gray-100" />
                      )}
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-xs text-gray-500">{p.sku ?? "—"}</p>
                        <p className="mt-0.5 font-medium text-slate-800">
                          {p.product_desc ?? "—"}
                        </p>
                        <div className="mt-2 flex flex-wrap justify-end gap-x-2 gap-y-0.5 text-xs text-gray-600">
                            {getProductAttributes(p).map(({ label, value }) => (
                              <span key={label}>{label}: {value}</span>
                            ))}
                          </div>
                        <div className="mt-2 flex flex-wrap justify-end gap-x-4 gap-y-1 text-sm">
                          <span>כמות: {p.qty}</span>
                          <span>{formatCurrency(Number(p.unit_price))} ליח׳</span>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
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
                          <div className="flex gap-4">
                            {p.picture_url ? (
                              <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-transform hover:scale-[1.02]">
                                <Image
                                  src={p.picture_url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="112px"
                                />
                              </div>
                            ) : (
                              <div className="h-36 w-28 shrink-0 rounded-lg border border-gray-200 bg-gray-100" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-800">
                                {p.product_desc ?? "—"}
                              </p>
                              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
                                  {getProductAttributes(p).map(({ label, value }) => (
                                    <span key={label}>{label}: {value}</span>
                                  ))}
                                </div>
                            </div>
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

          {/* Section 3: Financial summary footer — full-width brand bar, aligned left */}
          <div
            className="flex flex-col gap-6 rounded-b-xl px-4 py-6 text-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-4 md:px-8"
            style={{ backgroundColor: BRAND_RED }}
          >
            <div className="flex flex-col gap-4 text-left sm:flex-row sm:flex-wrap sm:gap-8 md:gap-12">
              <div className="text-left">
                <p className="text-sm opacity-90">סה&quot;כ ללא מע&quot;מ</p>
                <p className="text-base font-semibold sm:text-lg" dir="ltr">{formatCurrency(subtotal)}</p>
              </div>
              <div className="text-left">
                <p className="text-sm opacity-90">מע&quot;מ ({quote.vat}%)</p>
                <p className="text-base font-semibold sm:text-lg" dir="ltr">{formatCurrency(vatAmount)}</p>
              </div>
              <div className="text-left">
                <p className="text-sm opacity-90">סה&quot;כ לתשלום</p>
                <p className="text-lg font-bold sm:text-xl" dir="ltr">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Terms & conditions */}
          <div className="border-t border-gray-100 p-4 sm:p-6 md:p-8">
            <h3
              className="mb-4 text-base font-bold sm:text-lg"
              style={{ color: BRAND_RED }}
            >
              תנאי תשלום ומסחר
            </h3>
            {paymentTerms.length > 0 ? (
              <ul className="space-y-2 text-base text-gray-700 sm:text-sm">
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
            <div className="border-t border-gray-100 p-4 sm:p-6 md:p-8">
              <QuoteSignature />
            </div>
          )}
        </div>

        <footer className="mt-6 text-center text-sm text-gray-500 md:mt-8">
          <p>כנרת 10, איירפורט סיטי</p>
          <Link
            href="/"
            className="mt-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-base text-gray-600 transition-colors hover:text-[#801a1e] sm:min-h-0 sm:min-w-0 sm:text-sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            csquotes.vercel.app
          </Link>
        </footer>
      </div>
    </div>
    </QuoteReveal>
  );
}
