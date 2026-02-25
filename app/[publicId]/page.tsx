import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heebo } from "next/font/google";
import { getQuoteByPublicId } from "@/lib/quotes-db";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

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
        {/* Main card: digital paper */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:p-8 lg:p-10">
          {/* Header: two columns (RTL — right then left in DOM) */}
          <header className="mb-8 flex flex-col gap-6 border-b border-gray-200 pb-8 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                השטיח שלי
              </h1>
              {quote.project_name && (
                <p className="text-lg text-slate-700">{quote.project_name}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 text-left">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                הצעת מחיר
              </span>
              <p className="text-sm text-gray-500">
                {quote.invoice_id
                  ? `מס׳ ${quote.invoice_id.slice(0, 8)}…`
                  : quote.public_id}
              </p>
              <p className="text-sm text-gray-600">
                תאריך: {formatDate(quote.invoice_creation_date)}
              </p>
            </div>
          </header>

          {/* Customer & Representative — 2-column grid */}
          <section className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
              <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                לכבוד
              </h2>
              <p className="text-lg font-medium text-slate-800">
                {customer?.customer_name ?? "—"}
              </p>
              {customer?.customer_id && (
                <p className="mt-1 text-sm text-gray-500">
                  מס׳ לקוח: {customer.customer_id}
                </p>
              )}
            </div>
            {representative && (
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                {representative.rep_avatar ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
                    <Image
                      src={representative.rep_avatar}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-lg font-medium text-slate-600">
                    {representative.rep_full_name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-800">
                    {representative.rep_full_name}
                  </p>
                  {representative.rep_phone && (
                    <a
                      href={`tel:${representative.rep_phone.replace(/\D/g, "")}`}
                      className="text-sm text-gray-600 hover:text-indigo-600 hover:underline"
                    >
                      {representative.rep_phone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Products table */}
          <section className="mb-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-right">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="py-4 px-4 text-sm font-medium text-gray-600">
                      תמונה
                    </th>
                    <th className="py-4 px-4 text-sm font-medium text-gray-600">
                      תיאור ו-SKU
                    </th>
                    <th className="py-4 px-4 text-sm font-medium text-gray-600">
                      כמות
                    </th>
                    <th className="py-4 px-4 text-sm font-medium text-gray-600">
                      מחיר יחידה
                    </th>
                    <th className="py-4 px-4 text-sm font-medium text-gray-600">
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
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          {p.picture_url ? (
                            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                              <Image
                                src={p.picture_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-xs text-gray-400">
                              —
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-800">
                            {p.product_desc ?? "—"}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {p.sku ?? "—"}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-gray-700">{p.qty}</td>
                        <td className="py-4 px-4 text-gray-700">
                          {formatCurrency(Number(p.unit_price))}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-800">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Financial summary (bottom left in RTL) + Terms (bottom right) */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="w-full rounded-xl bg-gray-50 p-6 lg:w-72">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
                סיכום כספי
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>סה&quot;כ ביניים</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>מע&quot;מ ({quote.vat}%)</span>
                  <span>{formatCurrency(vatAmount)}</span>
                </div>
                <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-slate-800">
                  <span>סה&quot;כ לתשלום</span>
                  <span className="text-indigo-700">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {paymentTerms.length > 0 && (
              <div className="flex-1 lg:max-w-md">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                  תנאי תשלום ומסחר
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {paymentTerms.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 shrink-0 text-gray-400" aria-hidden>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span>{t.term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Product list section */}
          {products.length > 0 && (
            <section className="mt-10 border-t border-gray-200 pt-8">
              <h2 className="mb-4 text-lg font-medium text-slate-800">
                להלן רשימת המוצרים המשתתפים בהצעה
              </h2>
              <ul className="space-y-3">
                {products.map((p, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-0.5 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <p className="font-medium text-slate-800">
                      שם המוצר: {p.product_desc ?? "—"}
                    </p>
                    <p className="text-sm text-gray-500">
                      טכניקת אריגה: {p.technique ?? "—"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Digital signature */}
          {quote.require_signature && (
            <section className="mt-10 rounded-xl border border-gray-200 bg-gray-50/50 p-6">
              <h3 className="mb-4 text-base font-medium text-slate-800">
                חתימה דיגיטלית על הצעת המחיר
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-500">
                    שם החותמ/ת
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-500">
                    תפקיד
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                    placeholder="—"
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">יש לחתום מעלה</p>
              <button
                type="button"
                disabled
                className="mt-4 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                שלח
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>כנרת 10, איירפורט סיטי</p>
          <p>
            <Link
              href="/"
              className="text-gray-600 hover:text-indigo-600 hover:underline"
            >
              csquotes.vercel.app
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
