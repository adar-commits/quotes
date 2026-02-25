import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getQuoteByPublicId } from "@/lib/quotes-db";

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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100" dir="rtl">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold tracking-tight">
            הצעת מחיר מס {quote.invoice_id ?? quote.public_id}
          </h1>
        </header>

        {/* Customer block */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <dl className="grid gap-2 text-base sm:grid-cols-2">
            {customer?.customer_name != null && (
              <>
                <dt className="font-medium text-zinc-500">שם לקוח</dt>
                <dd>{customer.customer_name}</dd>
              </>
            )}
            {quote.quotation_id && (
              <>
                <dt className="font-medium text-zinc-500">מס&apos; הצעה</dt>
                <dd>{quote.quotation_id}</dd>
              </>
            )}
            <dt className="font-medium text-zinc-500">תאריך הפקה</dt>
            <dd>{formatDate(quote.invoice_creation_date)}</dd>
            {quote.project_name && (
              <>
                <dt className="font-medium text-zinc-500">שם הפרויקט</dt>
                <dd>{quote.project_name}</dd>
              </>
            )}
          </dl>
        </section>

        {/* Representative */}
        {representative && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-500">מפיק ההצעה</h2>
            <div className="flex items-center gap-4">
              {representative.rep_avatar && (
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <Image
                    src={representative.rep_avatar}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium">{representative.rep_full_name}</p>
                {representative.rep_phone && (
                  <a
                    href={`tel:${representative.rep_phone.replace(/\D/g, "")}`}
                    className="text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    {representative.rep_phone}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Products table */}
        <section className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-right">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <th className="p-3 text-sm font-medium text-zinc-500">מק&quot;ט</th>
                  <th className="p-3 text-sm font-medium text-zinc-500">תאור מוצר</th>
                  <th className="p-3 text-sm font-medium text-zinc-500">כמות</th>
                  <th className="p-3 text-sm font-medium text-zinc-500">מחיר ליח&apos;</th>
                  <th className="p-3 text-sm font-medium text-zinc-500">סה״כ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const lineTotal =
                    p.qty * (Number(p.unit_price) - Number(p.unit_discount));
                  return (
                    <tr
                      key={i}
                      className="border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="p-3">{p.sku ?? "—"}</td>
                      <td className="p-3">{p.product_desc ?? "—"}</td>
                      <td className="p-3">{p.qty}</td>
                      <td className="p-3">{formatCurrency(Number(p.unit_price))}</td>
                      <td className="p-3 font-medium">{formatCurrency(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <div className="flex max-w-xs flex-col gap-2 text-base">
            <div className="flex justify-between">
              <span className="text-zinc-500">סה&apos;&apos;כ ללא מע&quot;מ</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">מע״מ ({quote.vat}%)</span>
              <span>{formatCurrency(vatAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3 font-semibold dark:border-zinc-700">
              <span>סה&apos;&apos;כ לתשלום</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </section>

        {/* Payment terms */}
        {paymentTerms.length > 0 && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-3 text-base font-medium">תנאי תשלום ומסחר</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {paymentTerms.map((t, i) => (
                <li key={i}>{t.term}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer contact placeholder - same structure as reference */}
        <footer className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
          <p>כנרת 10, איירפורט סיטי</p>
          <p>
            <Link href="/" className="hover:underline">
              csquotes.vercel.app
            </Link>
          </p>
        </footer>

        {/* Product list section */}
        {products.length > 0 && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-medium">
              להלן רשימת המוצרים המשתתפים בהצעה
            </h2>
            <ul className="space-y-4">
              {products.map((p, i) => (
                <li key={i} className="border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800">
                  <p className="font-medium">שם המוצר: {p.product_desc ?? "—"}</p>
                  <p className="text-sm text-zinc-500">טכניקת אריגה: {p.technique ?? "—"}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer repeated */}
        <footer className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
          <p>כנרת 10, איירפורט סיטי</p>
          <p>
            <Link href="/" className="hover:underline">
              csquotes.vercel.app
            </Link>
          </p>
        </footer>

        {/* Digital signature */}
        {quote.require_signature && (
          <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-base font-medium">
              חתימה דיגיטלית על הצעת המחיר
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-500">שם החותמ/ת</label>
                <input
                  type="text"
                  disabled
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="—"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-500">תפקיד</label>
                <input
                  type="text"
                  disabled
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="—"
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-500">יש לחתום מעלה</p>
            <button
              type="button"
              disabled
              className="mt-4 rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-500 dark:bg-zinc-700"
            >
              שלח
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
