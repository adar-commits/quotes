import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Quotes
      </h1>
      <nav className="flex gap-4">
        <Link href="/login" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          התחברות
        </Link>
        <Link href="/settings" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          הגדרות תבניות
        </Link>
      </nav>
    </div>
  );
}
