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

export const dynamic = "force-dynamic";

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

/** Hide punctuation-only placeholders stored by upstream systems (e.g. ","). */
function meaningfulLine(s: string | null | undefined): string | null {
  const t = typeof s === "string" ? s.trim() : "";
  if (!t) return null;
  if (/^[,;:.!?\-–—\s]+$/u.test(t)) return null;
  return t;
}

function repAvatarUsesImg(src: string): boolean {
  return /\.svg(\?|$)/i.test(src) || src.includes("fireberry.com/app/static/media/");
}

function RepresentativeAvatar({
  src,
  fallback,
}: {
  src: string | null | undefined;
  fallback: string;
}) {
  const url = src?.trim();
  if (!url) {
    return (
      <Image
        src={fallback}
        alt=""
        fill
        className="object-cover"
        sizes="64px"
      />
    );
  }
  if (repAvatarUsesImg(url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG / CRM icons; next/image remote SVG is unreliable
      <img
        src={url}
        alt=""
        className="h-full w-full object-contain object-center p-1"
      />
    );
  }
  return (
    <Image
      src={url}
      alt=""
      fill
      className="object-cover"
      sizes="64px"
    />
  );
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
              <div className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white px-3 py-3 backdrop-blur-sm sm:px-5 sm:py-4 md:px-6 md:py-5">
                <div
                  className="rounded-xl border border-slate-200/60 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5 sm:p-5"
                  dir="rtl"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
                    <div className="order-2 flex min-w-0 gap-3 border-t border-slate-100 pt-4 md:order-1 md:w-[min(100%,272px)] md:shrink-0 md:border-t-0 md:pt-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50">
                        <RepresentativeAvatar
                          src={representative.rep_avatar}
                          fallback={REP_AVATAR_FALLBACK}
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5 text-right text-sm leading-snug">
                        <p
                          className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500"
                          style={{ color: mainColor }}
                        >
                          מפיק ההצעה
                        </p>
                        <p className="font-medium whitespace-pre-line text-slate-800">
                          {meaningfulLine(representative.rep_full_name) ?? "—"}
                        </p>
                        {representative.rep_phone ? (
                          <p>
                            <span
                              style={{ color: mainColor }}
                              className="font-medium"
                            >
                              טלפון:{" "}
                            </span>
                            <a
                              href={`tel:${representative.rep_phone.replace(/\D/g, "")}`}
                              className="text-slate-700 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
                              style={{ WebkitTapHighlightColor: "transparent" }}
                            >
                              {representative.rep_phone}
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className="hidden w-px shrink-0 self-stretch bg-slate-200/90 md:order-2 md:mx-4 md:block"
                      aria-hidden
                    />

                    <div className="order-1 min-w-0 space-y-2.5 text-right md:order-3 md:flex-1">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p
                            className="text-[0.7rem] font-medium uppercase leading-tight tracking-wide text-slate-500"
                            style={{ color: mainColor }}
                          >
                            מס׳ הצעה
                          </p>
                          <p className="mt-0.5 text-sm leading-snug text-slate-800">
                            {quote.public_id
                              ? quote.public_id.slice(-10)
                              : quote.quotation_id ?? quote.invoice_id ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-[0.7rem] font-medium uppercase leading-tight tracking-wide text-slate-500"
                            style={{ color: mainColor }}
                          >
                            תאריך הפקה
                          </p>
                          <p className="mt-0.5 text-sm leading-snug text-slate-800">
                            {formatDate(quote.invoice_creation_date)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p
                          className="text-[0.7rem] font-medium uppercase leading-tight tracking-wide text-slate-500"
                          style={{ color: mainColor }}
                        >
                          לכבוד
                        </p>
                        <p className="mt-0.5 text-sm leading-snug text-slate-800">
                          {quote.agent_desc?.trim() || "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[0.7rem] font-medium uppercase leading-tight tracking-wide text-slate-500"
                          style={{ color: mainColor }}
                        >
                          שם הפרויקט
                        </p>
                        <p className="mt-0.5 text-sm leading-snug text-slate-800">
                          {quote.project_name ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[0.7rem] font-medium uppercase leading-tight tracking-wide text-slate-500"
                          style={{ color: mainColor }}
                        >
                          שם לקוח
                        </p>
                        <p className="mt-0.5 text-sm leading-snug text-slate-800">
                          {(meaningfulLine(customer?.customer_name) ||
                            customer?.customer_id?.trim()) ??
                            "—"}
                        </p>
                        {customer?.customer_logo ? (
                          <div className="relative ml-auto mt-2 h-12 w-auto max-w-[120px] aspect-2/1 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50">
                            <Image
                              src={customer.customer_logo}
                              alt=""
                              fill
                              className="object-contain object-right"
                              sizes="120px"
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
                <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white/85 px-4 py-4 shadow-sm ring-1 ring-slate-900/5 sm:px-6 sm:py-5">
                  <h2 className="text-right text-lg font-bold text-slate-800 sm:text-xl">
                    להלן רשימת המוצרים המשתתפים בהצעה
                  </h2>
                </div>
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
                        <div className="hidden w-full shrink-0 md:block md:w-[20.24rem] md:max-w-[34.5%]">
                          <ProductImageWithLightbox
                            src={p.picture_url}
                            fill
                            className="object-contain"
                            containerClassName="relative mx-auto h-[16.56rem] w-full max-w-[22.08rem] overflow-hidden rounded-xl bg-white md:h-[22.08rem] md:max-w-none"
                            sizes="(max-width: 768px) 100vw, 414px"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-4 text-right md:max-w-[55%]">
                          <div className="flex justify-end md:hidden">
                            <ApprovalStatusSelect
                              quotePublicId={publicId}
                              productSortOrder={p.sort_order}
                              initialStatus={p.approval_status}
                              mainColor={template?.main_color}
                            />
                          </div>
                          <div
                            className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-3 text-sm"
                            dir="rtl"
                          >
                            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
                              <span className="text-slate-600">
                                כמות:{" "}
                                <strong className="text-slate-800">
                                  {p.qty}
                                </strong>
                              </span>
                              <span className="text-slate-600">
                                {formatCurrency(Number(p.unit_price))} ליח׳
                              </span>
                              <span className="font-bold text-slate-800">
                                {formatCurrency(lineTotal)}
                              </span>
                            </div>
                            <div className="hidden shrink-0 md:block">
                              <ApprovalStatusSelect
                                quotePublicId={publicId}
                                productSortOrder={p.sort_order}
                                initialStatus={p.approval_status}
                                mainColor={template?.main_color}
                              />
                            </div>
                          </div>
                          <div className="w-full md:hidden">
                            <ProductImageWithLightbox
                              src={p.picture_url}
                              fill
                              className="object-contain"
                              containerClassName="relative mx-auto h-[16.56rem] w-full max-w-[22.08rem] overflow-hidden rounded-xl bg-white"
                              sizes="(max-width: 768px) 100vw, 414px"
                            />
                          </div>
                          <div className="space-y-2">
                            {p.sku?.trim() ? (
                              <p className="leading-relaxed">
                                <span
                                  className="font-bold text-slate-800"
                                  style={{ color: mainColor }}
                                >
                                  מק&quot;ט:{" "}
                                </span>
                                <span className="text-slate-700">{p.sku}</span>
                              </p>
                            ) : null}
                            {p.product_desc?.trim() ? (
                              <p className="leading-relaxed">
                                <span
                                  className="font-bold text-slate-800"
                                  style={{ color: mainColor }}
                                >
                                  שם המוצר:{" "}
                                </span>
                                <span className="text-slate-700">
                                  {p.product_desc}
                                </span>
                              </p>
                            ) : null}
                            {attrs.map(({ label, value }) => (
                              <p key={label} className="leading-relaxed">
                                <span
                                  className="font-bold text-slate-800"
                                  style={{ color: mainColor }}
                                >
                                  {label}:{" "}
                                </span>
                                <span className="text-slate-700">{value}</span>
                              </p>
                            ))}
                            {p.additional_desc?.trim() ? (
                              <p className="leading-relaxed text-slate-700">
                                <span
                                  className="font-bold text-slate-800"
                                  style={{ color: mainColor }}
                                >
                                  הערה:{" "}
                                </span>
                                {p.additional_desc.trim()}
                              </p>
                            ) : null}
                          </div>
                          <div
                            className="border-t border-dashed border-slate-300 pt-3"
                            aria-hidden
                          />
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
