import type { NextRequest } from "next/server";

function normalizeBaseUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const s = raw.trim().replace(/\/$/, "");
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

/**
 * Canonical public base URL (no trailing slash) for quote links, redirects, etc.
 * Prefer `APP_URL` on the server so API responses stay correct when callers hit
 * *.vercel.app while the customer-facing domain is custom.
 */
export function resolvePublicAppBase(request: NextRequest): string {
  const fromEnv =
    normalizeBaseUrl(process.env.APP_URL) ??
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv) return fromEnv;
  return request.nextUrl.origin.replace(/\/$/, "");
}

/** Same resolution as {@link resolvePublicAppBase} when you only have a fallback origin string. */
export function resolvePublicAppOrigin(fallbackOrigin: string): string {
  const fromEnv =
    normalizeBaseUrl(process.env.APP_URL) ??
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv) return new URL(fromEnv).origin;
  return fallbackOrigin;
}
