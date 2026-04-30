import Link from "next/link";
import BranchFilter from "@/components/BranchFilter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 p-4 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Quotes
      </h1>
      <nav className="flex gap-4">
        <Link
          href="/login"
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          התחברות
        </Link>
        <Link
          href="/settings"
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          הגדרות תבניות
        </Link>
      </nav>
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-zinc-900 p-5 dark:border-zinc-800"
        dir="rtl"
      >
        <p className="mb-3 text-sm text-zinc-300">סינון סניפים (תצוגה כהה)</p>
        <BranchFilter />
      </div>
    </div>
  );
}
