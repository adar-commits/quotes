import { firstNonEmptyString } from "@/lib/quotation-customer-extract";

/** Maps POST body `Representative` (and common aliases) into DB columns. */
export function extractQuotationRepresentativeFields(raw: Record<string, unknown>): {
  rep_phone: string | null;
  rep_email: string | null;
  rep_avatar: string | null;
  rep_full_name: string | null;
} | null {
  const block =
    raw.Representative ??
    raw.representative ??
    raw.REPRESENTATIVE;

  if (!block || typeof block !== "object" || Array.isArray(block)) {
    return null;
  }

  const o = block as Record<string, unknown>;

  const rep_phone = firstNonEmptyString(
    o.repPhone,
    o.rep_phone,
    o.RepPhone
  );
  const rep_email = firstNonEmptyString(
    o.repEmail,
    o.rep_email,
    o.RepEmail
  );
  const rep_avatar = firstNonEmptyString(
    o.repAvatar,
    o.rep_avatar,
    o.RepAvatar
  );
  const rep_full_name = firstNonEmptyString(
    o.repFullName,
    o.rep_full_name,
    o.RepFullName
  );

  if (!rep_phone && !rep_email && !rep_avatar && !rep_full_name) {
    return null;
  }

  return {
    rep_phone: rep_phone ?? null,
    rep_email: rep_email ?? null,
    rep_avatar: rep_avatar ?? null,
    rep_full_name: rep_full_name ?? null,
  };
}
