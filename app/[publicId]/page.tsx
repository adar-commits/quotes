import { notFound } from "next/navigation";
import Image from "next/image";
import { calculateQuoteBreakdown } from "@/lib/quote-total";
import { getQuoteByPublicId } from "@/lib/quotes-db";
import QuoteProductsTable from "./QuoteProductsTable";
import QuoteSignature from "./QuoteSignature";
import QuoteReveal from "./QuoteReveal";
import ApprovalStatusSelect from "./ApprovalStatusSelect";
import ContactStrip from "./ContactStrip";
import ProductImageWithLightbox from "./ProductImageWithLightbox";
import QuoteBanner from "./QuoteBanner";

const DEFAULT_MAIN = "#801a1e";

const REP_AVATAR_FALLBACK =
  "https://cdn.shopify.com/s/files/1/0594/9839/7887/files/iScreen_Shoter_-_Google_Chrome_-_260429144738-removebg-preview.png?v=1777463340";

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

/** Only attributes with non-empty values from the API — no placeholder defaults. */
function getProductAttributes(p: {
  color?: string | null;
  shape?: string | null;
  material?: string | null;
  technique?: string | null;
}): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const add = (label: string, raw: string | null | undefined) => {
    const v = typeof raw === "string" ? raw.trim() : "";
    if (v) out.push({ label, value: v });
  };
  add("צבע", p.color);
  add("צורה", p.shape);
  add("חומר", p.material);
  add("טכניקת אריגה", p.technique);
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const data = await getQuoteByPublicId(publicId);
  if (!data?.template) return {};
  const t = data.template;
  return {
    themeColor: t.main_color,
    icons: t.favicon_url ? { icon: t.favicon_url } : undefined,
  };
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const data = await getQuoteByPublicId(publicId);
  if (!data) notFound();

  const { quote, customer, representative, products, paymentTerms, template } = data;
  const mainColor = template?.main_color ?? DEFAULT_MAIN;
  const bulletsColor = template?.bullets_color ?? mainColor;

  const breakdown = calculateQuoteBreakdown({
    vat: Number(quote.vat),
    specialDiscount: Number(quote.special_discount),
    lines: products.map((p) => ({
      qty: p.qty,
      unitPrice: Number(p.unit_price),
      unitDiscount: Number(p.unit_discount),
    })),
  });

  return (
    <QuoteReveal>
      {/* Carpet-style background + frosted glass container */}
      <div className="min-h-screen antialiased" dir="rtl">
        {/* Carpet-oriented background with slight blur layer */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: template?.background_url
              ? `url(${template.background_url})`
              : "url(https://images.unsplash.com/photo-1600166898405-da9535204843?w=1920)",
          }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-amber-100/85 via-rose-50/80 to-stone-200/85 backdrop-blur-[2px]" aria-hidden />
        <div className="mx-auto max-w-5xl p-4 py-6 md:p-8 md:py-8">
          <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur-xl">
            {/* Page 1: Chart only — banner + customer/salesperson (right) + quote details + financial summary */}
            <div className="border-b border-slate-200/60">
              <QuoteBanner bannerUrl={template?.banner_url} />
              <div className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white p-4 backdrop-blur-sm sm:p-6 md:p-8">
                <div
                  className="rounded-2xl border border-slate-200/60 bg-white/85 p-5 shadow-sm ring-1 ring-slate-900/5 sm:p-6 md:p-8"
                  dir="rtl"
                >
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
                    <div className="text-right">
                      <p
                        className="text-[0.825rem] font-normal uppercase leading-snug tracking-wider"
                        style={{ color: mainColor }}
                      >
                        מפיק ההצעה
                      </p>
                      <div className="relative mt-2 mr-0 ml-auto h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50">
                        <Image
                          src={
                            representative?.rep_avatar?.trim()
                              ? representative.rep_avatar
                              : REP_AVATAR_FALLBACK
                          }
                          alt=""
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <p className="mt-2 text-[0.825rem] font-normal leading-snug text-slate-700">
                        {representative?.rep_full_name ?? "—"}
                      </p>
                      {(representative?.rep_email?.trim() ||
                        representative?.rep_phone) && (
                        <div
                          className="mt-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[0.825rem]"
                          dir="ltr"
                        >
                          {representative?.rep_email?.trim() ? (
                            <a
                              href={`mailto:${representative.rep_email.trim()}`}
                              className="rounded-lg px-1 py-1 font-normal leading-snug text-slate-600 transition-colors hover:bg-slate-100 hover:opacity-90"
                              style={{ WebkitTapHighlightColor: "transparent" }}
                            >
                              {representative.rep_email.trim()}
                            </a>
                          ) : null}
                          {representative?.rep_phone ? (
                            <a
                              href={`tel:${representative.rep_phone.replace(/\D/g, "")}`}
                              className="rounded-lg px-1 py-1 font-normal leading-snug text-slate-600 transition-colors hover:bg-slate-100 hover:opacity-90 sm:min-h-[44px] sm:min-w-[44px] sm:inline-flex sm:items-center sm:justify-center sm:py-2"
                              style={{ WebkitTapHighlightColor: "transparent" }}
                            >
                              {representative.rep_phone}
                            </a>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="space-y-4 text-right">
                      <div>
                        <p
                          className="text-[0.825rem] font-normal uppercase leading-snug tracking-wider"
                          style={{ color: mainColor }}
                        >
                          מס׳ הצעה
                        </p>
                        <p className="mt-1 text-[0.825rem] font-normal leading-snug text-slate-700">
                          {quote.public_id
                            ? quote.public_id.slice(-10)
                            : quote.quotation_id ?? quote.invoice_id ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[0.825rem] font-normal uppercase leading-snug tracking-wider"
                          style={{ color: mainColor }}
                        >
                          תאריך הפקה
                        </p>
                        <p className="mt-1 text-[0.825rem] font-normal leading-snug text-slate-700">
                          {formatDate(quote.invoice_creation_date)}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[0.825rem] font-normal uppercase leading-snug tracking-wider"
                          style={{ color: mainColor }}
                        >
                          שם הפרויקט
                        </p>
                        <p className="mt-1 text-[0.825rem] font-normal leading-snug text-slate-700">
                          {quote.project_name ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[0.825rem] font-normal uppercase leading-snug tracking-wider"
                          style={{ color: mainColor }}
                        >
                          שם לקוח
                        </p>
                        <p className="mt-1 text-[0.825rem] font-normal leading-snug text-slate-700">
                          {(customer?.customer_name || customer?.customer_id) ??
                            "—"}
                        </p>
                        {customer?.customer_logo ? (
                          <div className="mt-3 relative ml-auto h-16 w-auto max-w-[140px] aspect-[2/1] overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50">
                            <Image
                              src={customer.customer_logo}
                              alt=""
                              fill
                              className="object-contain object-right"
                              sizes="140px"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <QuoteProductsTable
                products={products}
                mainColor={mainColor}
                quoteVat={Number(quote.vat)}
                breakdown={breakdown}
              />
              {/* Terms: headline text-right */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 md:p-8">
                <h3
                  className="mb-4 text-right text-base font-bold sm:text-lg"
                  style={{ color: mainColor }}
                >
                  תנאי תשלום ומסחר
                </h3>
                {paymentTerms.length > 0 ? (
                  <ul className="space-y-3 text-base text-slate-700 sm:text-sm">
                    {paymentTerms.map((t, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span
                          className="mt-2 h-2 w-2 shrink-0 rounded-full opacity-90"
                          style={{ backgroundColor: bulletsColor }}
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

            {/* Product pages: contact strip + heading + product rows (picture + attributes) + contact strip */}
            <section className="border-t border-slate-200/80">
              <ContactStrip mainColor={template?.main_color ?? template?.contact_strip_bg} />
              <div className="px-4 py-6 md:px-8">
                <h2 className="mb-6 text-right text-lg font-bold text-slate-800 sm:text-xl">
                  להלן רשימת המוצרים המשתתפים בהצעה
                </h2>
                {/* Product rows: image visible + attributes next to it (reference layout) */}
                <ul className="space-y-8">
                  {products.map((p, i) => {
                    const lineTotal =
                      p.qty * (Number(p.unit_price) - Number(p.unit_discount));
                    const attrs = getProductAttributes(p);
                    return (
                      <li
                        key={i}
                        className="quote-card-hover flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-md ring-1 ring-slate-900/5 backdrop-blur-sm md:flex-row md:items-start md:gap-6 md:p-6"
                      >
                        {/* Product image + SKU below (theme red) — narrower column to give +10% to text */}
                        <div className="flex w-full shrink-0 flex-col items-center md:w-[17.6rem] md:max-w-[30%]">
                          <div className="w-full">
                            <ProductImageWithLightbox
                              src={p.picture_url}
                              fill
                              className="object-contain"
                              containerClassName="relative mx-auto h-[14.4rem] w-full max-w-[19.2rem] overflow-hidden rounded-xl bg-white md:h-[19.2rem] md:max-w-none"
                              sizes="(max-width: 768px) 100vw, 360px"
                            />
                          </div>
                          {p.sku?.trim() ? (
                            <p
                              className="mt-3 text-center text-sm font-semibold uppercase tracking-wide"
                              style={{ color: mainColor }}
                            >
                              {p.sku}
                            </p>
                          ) : null}
                        </div>
                        {/* Attributes + pricing row with סטטוס אישור */}
                        <div className="min-w-0 flex-1 space-y-3 text-right md:max-w-[55%]">
                          <div className="space-y-2">
                            {p.product_desc?.trim() ? (
                              <p className="leading-relaxed">
                                <span className="font-bold text-slate-800" style={{ color: mainColor }}>שם המוצר: </span>
                                <span className="text-slate-700">{p.product_desc}</span>
                              </p>
                            ) : null}
                            {attrs.map(({ label, value }) => (
                              <p key={label} className="leading-relaxed">
                                <span className="font-bold text-slate-800" style={{ color: mainColor }}>{label}: </span>
                                <span className="text-slate-700">{value}</span>
                              </p>
                            ))}
                            {p.additional_desc?.trim() ? (
                              <p className="leading-relaxed text-slate-700">
                                <span className="font-bold text-slate-800" style={{ color: mainColor }}>הערה: </span>
                                {p.additional_desc.trim()}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 border-t border-slate-100 pt-3 text-sm">
                            <span className="text-slate-600">
                              כמות: <strong className="text-slate-800">{p.qty}</strong>
                            </span>
                            <span className="text-slate-600">
                              {formatCurrency(Number(p.unit_price))} ליח׳
                            </span>
                            <span className="font-bold text-slate-800">
                              {formatCurrency(lineTotal)}
                            </span>
                            <div className="w-fit shrink-0">
                              <ApprovalStatusSelect
                                quotePublicId={publicId}
                                productSortOrder={p.sort_order}
                                initialStatus={p.approval_status}
                                mainColor={template?.main_color}
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <ContactStrip mainColor={template?.main_color ?? template?.contact_strip_bg} />
            </section>

            {/* Signature footer at end of product pages */}
            {quote.require_signature && (
              <div className="border-t border-slate-100 bg-slate-50/30 p-4 sm:p-6 md:p-8">
                <QuoteSignature quotePublicId={publicId} />
              </div>
            )}
          </div>
      </div>
    </div>
    </QuoteReveal>
  );
}
