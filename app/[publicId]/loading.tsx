import { Noto_Sans_Hebrew } from "next/font/google";

const noto = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export default function QuoteLoading() {
  return (
    <div
      className={`min-h-screen bg-gray-50 antialiased ${noto.className}`}
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl p-4 py-6 md:p-8 md:py-8">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Hero banner skeleton */}
          <div className="h-32 w-full animate-pulse bg-gray-200 sm:h-40 md:h-52" />

          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {/* 3-column info header skeleton */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-24" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 sm:h-6 sm:w-40" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-28" />
                <div className="h-4 w-full max-w-[8rem] animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-28 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-32" />
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-gray-200 sm:h-20 sm:w-20" />
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 sm:h-5 sm:w-32" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-28" />
                </div>
              </div>
            </div>

            {/* Mobile: card list skeleton */}
            <div className="mb-6 space-y-3 md:hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="h-20 w-16 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table skeleton */}
            <div className="mb-8 hidden border-t-2 border-b-2 border-gray-200 md:block">
              <div className="flex gap-4 border-b border-gray-100 py-4">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full max-w-xs animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 border-b border-gray-100 py-4">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full max-w-sm animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  </div>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>

            {/* Financial bar skeleton */}
            <div className="mb-6 flex flex-col gap-3 rounded-b-xl bg-gray-300 p-4 sm:mb-8 sm:flex-row sm:gap-8 sm:p-6">
              <div className="h-8 w-24 animate-pulse rounded bg-gray-400" />
              <div className="h-8 w-24 animate-pulse rounded bg-gray-400" />
              <div className="h-8 w-28 animate-pulse rounded bg-gray-400" />
            </div>

            {/* Terms skeleton */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-3 h-4 w-40 animate-pulse rounded bg-gray-200 sm:h-5 sm:w-48" />
              <ul className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="h-4 w-full max-w-md animate-pulse rounded bg-gray-100" />
                ))}
              </ul>
            </div>

            {/* Signature box skeleton */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 sm:p-6">
              <div className="mx-auto mb-4 h-5 w-48 animate-pulse rounded bg-gray-200 sm:h-6 sm:w-64" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="h-12 min-h-[44px] w-full animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-12 min-h-[44px] w-full animate-pulse rounded-lg bg-gray-200" />
                </div>
                <div className="h-40 w-full animate-pulse rounded-lg bg-gray-100 sm:h-48" />
              </div>
              <div className="mt-4 h-12 min-h-[48px] w-full animate-pulse rounded-xl bg-gray-300 sm:mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
