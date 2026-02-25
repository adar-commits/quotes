import { Heebo } from "next/font/google";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export default function QuoteLoading() {
  return (
    <div
      className={`min-h-screen bg-gray-50 antialiased ${heebo.className}`}
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl p-4 py-8 md:p-8">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Hero banner skeleton */}
          <div className="h-40 w-full animate-pulse bg-gray-200 md:h-52" />

          <div className="p-6 md:p-8 lg:p-10">
            {/* 3-column info header skeleton */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Table skeleton */}
            <div className="mb-8 border-t-2 border-b-2 border-gray-200">
              <div className="flex gap-4 border-b border-gray-100 py-4">
                <div className="h-24 w-24 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 border-b border-gray-100 py-4"
                >
                  <div className="h-24 w-24 shrink-0 animate-pulse rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>

            {/* Financial bar skeleton */}
            <div className="mb-8 h-24 animate-pulse rounded-b-xl bg-gray-300" />

            {/* Terms skeleton */}
            <div className="mb-8">
              <div className="mb-3 h-5 w-48 animate-pulse rounded bg-gray-200" />
              <ul className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <li
                    key={i}
                    className="h-4 w-full animate-pulse rounded bg-gray-100"
                  />
                ))}
              </ul>
            </div>

            {/* Signature box skeleton */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">
              <div className="mx-auto mb-4 h-6 w-64 animate-pulse rounded bg-gray-200" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
                </div>
                <div className="h-48 w-full animate-pulse rounded-lg bg-gray-100" />
              </div>
              <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
