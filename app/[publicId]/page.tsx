import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getQuoteByPublicId } from "@/lib/quotes-db";
import QuoteSignature from "./QuoteSignature";
import QuoteReveal from "./QuoteReveal";
import QuoteBanner from "./QuoteBanner";
import DefaultAvatar from "./DefaultAvatar";
import ApprovalStatusSelect from "./ApprovalStatusSelect";
import ContactStrip from "./ContactStrip";
import ProductAttributesList from "./ProductAttributesList";
import ProductImageWithLightbox from "./ProductImageWithLightbox";

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
          <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur-xl">
            {/* Page 1: Quotation numbers chart — banner + info + financial summary only */}
            <div className="border-b border-slate-200/60">
              <QuoteBanner />
              <div className="grid grid-cols-1 gap-6 border-t border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white p-4 backdrop-blur-sm sm:p-6 md:grid-cols-3 md:p-8">
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md">
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
                    שם לקוח
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-800 sm:text-lg">
                    {customer?.customer_name ?? "—"}
                  </p>
                  {customer?.customer_logo && (
                    <div className="mt-3 relative h-16 w-auto max-w-[140px] aspect-[2/1] overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50">
                      <Image
                        src={customer.customer_logo}
                        alt=""
                        fill
                        className="object-contain object-left"
                        sizes="140px"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
                      מס׳ הצעה
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-800 sm:text-lg">{shortenId(quote.invoice_id ?? quote.quotation_id)}</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
                      תאריך הפקה
                    </p>
                    <p className="mt-1 text-slate-700">{formatDate(quote.invoice_creation_date)}</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">
                      שם הפרויקט
                    </p>
                    <p className="mt-1 text-slate-700">{quote.project_name ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-lg ring-2 ring-slate-200/80 sm:h-24 sm:w-24">
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
                        className="mt-1 inline-flex items-center rounded-lg px-2 py-1 text-base text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#801a1e] sm:min-h-[44px] sm:min-w-[44px] sm:justify-center sm:py-2 sm:text-sm"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {representative.rep_phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Chart of numbers — financial summary on page 1 (left-aligned) */}
              <div
                className="relative flex flex-col gap-6 px-4 py-6 text-white sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:px-8"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_RED} 0%, #5c1316 100%)`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.1)",
                }}
                dir="ltr"
              >
                <div className="flex flex-col gap-4 text-left sm:flex-row sm:flex-wrap sm:gap-8 md:gap-12">
                  <div className="text-left">
                    <p className="text-sm font-medium opacity-90">סה&quot;כ ללא מע&quot;מ</p>
                    <p className="text-base font-bold sm:text-lg">{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium opacity-90">מע&quot;מ ({quote.vat}%)</p>
                    <p className="text-base font-bold sm:text-lg">{formatCurrency(vatAmount)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium opacity-90">סה&quot;כ לתשלום</p>
                    <p className="text-xl font-bold sm:text-2xl">{formatCurrency(total)}</p>
                  </div>
                </div>
              </div>
              {/* Terms on page 1 (left-aligned) */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 md:p-8 text-left">
                <h3
                  className="mb-4 text-base font-bold sm:text-lg"
                  style={{ color: BRAND_RED }}
                >
                  תנאי תשלום ומסחר
                </h3>
                {paymentTerms.length > 0 ? (
                  <ul className="space-y-3 text-base text-slate-700 sm:text-sm">
                    {paymentTerms.map((t, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span
                          className="mt-2 h-2 w-2 shrink-0 rounded-full opacity-90"
                          style={{ backgroundColor: BRAND_RED }}
                          aria-hidden
                        />
                        <span className="leading-relaxed">{t.term}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">אין תנאים להצגה.</p>
                )}
              </div>
            </div>

            {/* Product pages: contact strip top + product rows + contact strip bottom */}
            <section className="border-t border-slate-200/80">
              <ContactStrip />
              <div className="px-4 py-6 md:px-8">
                {/* Mobile: product rows — image block first, then details/attributes/price/status */}
                <ul className="space-y-6 md:hidden">
                  {products.map((p, i) => {
                    const lineTotal =
                      p.qty * (Number(p.unit_price) - Number(p.unit_discount));
                    return (
                      <li
                        key={i}
                        className="quote-card-hover rounded-2xl border border-slate-200/80 bg-white/90 shadow-md overflow-hidden ring-1 ring-slate-900/5 backdrop-blur-sm"
                      >
                        <div className="flex justify-center border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-5">
                          <ProductImageWithLightbox
                            src={p.picture_url}
                            fill
                            className="object-contain"
                            containerClassName="relative h-52 w-full max-w-xs overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-inner"
                            sizes="(max-width: 384px) 100vw, 384px"
                          />
                        </div>
                        <div className="p-5 text-right space-y-3">
                          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">{p.sku ?? "—"}</p>
                          <p className="font-semibold text-slate-800 text-lg leading-snug">
                            {p.product_desc ?? "—"}
                          </p>
                          <ProductAttributesList
                            attributes={getProductAttributes(p)}
                            className="mt-3 rounded-xl bg-slate-50/80 p-3 border border-slate-100"
                          />
                          <div className="flex flex-wrap justify-end gap-x-5 gap-y-1 text-sm pt-3 border-t border-slate-100">
                            <span className="text-slate-600">כמות: <strong className="text-slate-800">{p.qty}</strong></span>
                            <span className="text-slate-600">{formatCurrency(Number(p.unit_price))} ליח׳</span>
                            <span className="font-bold text-slate-800">
                              {formatCurrency(lineTotal)}
                            </span>
                          </div>
                          <div className="pt-4">
                            <ApprovalStatusSelect
                              quotePublicId={publicId}
                              productSortOrder={p.sort_order}
                              initialStatus={p.approval_status}
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {/* Desktop: table — image column separate from description/price columns */}
                <div className="hidden overflow-x-auto md:block rounded-2xl border border-slate-200/80 overflow-hidden ring-1 ring-slate-900/5 shadow-sm">
                  <table className="w-full min-w-[720px] border-collapse text-right">
                    <thead>
                      <tr
                        className="border-b-2 border-slate-200"
                        style={{
                          background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                        }}
                      >
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          תמונה
                        </th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          מק&quot;ט
                        </th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          תאור מוצר
                        </th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          כמות
                        </th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          מחיר ליח׳
                        </th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          סה&quot;כ
                        </th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          סטטוס אישור
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
                            className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 even:bg-slate-50/30"
                          >
                            <td className="py-4 px-4 align-middle">
                              <ProductImageWithLightbox
                                src={p.picture_url}
                                fill
                                className="object-cover"
                                containerClassName="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm ring-1 ring-slate-900/5"
                                sizes="112px"
                              />
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-slate-700">
                              {p.sku ?? "—"}
                            </td>
                            <td className="py-4 px-4 align-top">
                              <p className="font-semibold text-slate-800">
                                {p.product_desc ?? "—"}
                              </p>
                              <div className="mt-2 rounded-lg bg-slate-50/80 p-2.5 border border-slate-100 w-fit max-w-sm">
                                <ProductAttributesList
                                  attributes={getProductAttributes(p)}
                                />
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-700 font-medium">{p.qty}</td>
                            <td className="py-4 px-4 text-slate-700">
                              {formatCurrency(Number(p.unit_price))}
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-800">
                              {formatCurrency(lineTotal)}
                            </td>
                            <td className="py-4 px-4 align-top">
                              <ApprovalStatusSelect
                                quotePublicId={publicId}
                                productSortOrder={p.sort_order}
                                initialStatus={p.approval_status}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <ContactStrip />
            </section>

            {/* Signature footer at end of product pages */}
            {quote.require_signature && (
              <div className="border-t border-slate-100 bg-slate-50/30 p-4 sm:p-6 md:p-8">
                <QuoteSignature />
              </div>
            )}
          </div>

        <footer className="mt-8 text-center">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-5 shadow-sm backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-600">כנרת 10, איירפורט סיטי</p>
            <Link
              href="/"
              className="mt-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-base font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#801a1e] sm:min-h-0 sm:min-w-0 sm:px-4 sm:text-sm"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              csquotes.vercel.app
            </Link>
          </div>
        </footer>
      </div>
    </div>
    </QuoteReveal>
  );
}
