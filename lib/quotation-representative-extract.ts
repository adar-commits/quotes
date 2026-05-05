import { firstNonEmptyString } from "@/lib/quotation-customer-extract";

/** Normalized representative fields for DB + JSON snapshot + UI. */
export type RepresentativeSnapshot = {
  rep_full_name: string | null;
  rep_title: string | null;
  rep_phone: string | null;
  rep_email: string | null;
  rep_avatar: string | null;
};

function representativeBlock(
  raw: Record<string, unknown>
): Record<string, unknown> | null {
  const b =
    raw.Representative ??
    raw.representative ??
    raw.REPRESENTATIVE;

  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  return b as Record<string, unknown>;
}

/**
 * Parses JSON stored on quotes.representative_snapshot (may be from older clients).
 */
export function normalizeRepresentativeSnapshot(
  value: unknown
): RepresentativeSnapshot | null {
  if (value == null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;

  const rep_full_name =
    firstNonEmptyString(
      v.rep_full_name,
      v.repFullName,
      v.fullName,
      v.name
    ) ?? null;
  const rep_title =
    firstNonEmptyString(v.rep_title, v.repTitle, v.title, v.jobTitle) ??
    null;
  const rep_phone =
    firstNonEmptyString(
      v.rep_phone,
      v.repPhone,
      v.phone,
      v.mobile,
      v.tel
    ) ?? null;
  const rep_email =
    firstNonEmptyString(v.rep_email, v.repEmail, v.email) ?? null;
  const rep_avatar =
    firstNonEmptyString(
      v.rep_avatar,
      v.repAvatar,
      v.avatar,
      v.photo,
      v.pictureUrl,
      v.pictureurl
    ) ?? null;

  if (
    !rep_full_name &&
    !rep_title &&
    !rep_phone &&
    !rep_email &&
    !rep_avatar
  ) {
    return null;
  }

  return {
    rep_full_name,
    rep_title,
    rep_phone,
    rep_email,
    rep_avatar,
  };
}

/** Reads CRM-style `Representative` / `representative` object with common aliases. */
export function extractRepresentativeSnapshot(
  raw: Record<string, unknown>
): RepresentativeSnapshot | null {
  const o = representativeBlock(raw);
  if (!o) return null;

  const rep_full_name =
    firstNonEmptyString(
      o.repFullName,
      o.rep_full_name,
      o.RepFullName,
      o.fullName,
      o.FullName,
      o.name,
      o.Name,
      o.displayName,
      o.DisplayName,
      o.contactName,
      o.ContactName
    ) ?? null;

  const rep_title =
    firstNonEmptyString(
      o.repTitle,
      o.rep_title,
      o.title,
      o.Title,
      o.jobTitle,
      o.JobTitle,
      o.role,
      o.Role,
      o.position,
      o.Position
    ) ?? null;

  const rep_phone =
    firstNonEmptyString(
      o.repPhone,
      o.rep_phone,
      o.RepPhone,
      o.phone,
      o.Phone,
      o.mobile,
      o.Mobile,
      o.tel,
      o.Tel
    ) ?? null;

  const rep_email =
    firstNonEmptyString(
      o.repEmail,
      o.rep_email,
      o.RepEmail,
      o.email,
      o.Email
    ) ?? null;

  const rep_avatar =
    firstNonEmptyString(
      o.repAvatar,
      o.rep_avatar,
      o.RepAvatar,
      o.avatar,
      o.Avatar,
      o.photo,
      o.Photo,
      o.image,
      o.Image,
      o.picture,
      o.pictureUrl,
      o.pictureurl
    ) ?? null;

  if (
    !rep_full_name &&
    !rep_title &&
    !rep_phone &&
    !rep_email &&
    !rep_avatar
  ) {
    return null;
  }

  return {
    rep_full_name,
    rep_title,
    rep_phone,
    rep_email,
    rep_avatar,
  };
}

/** INSERT into quote_representatives (+ snapshot column). */
export function extractQuotationRepresentativeFields(
  raw: Record<string, unknown>
): RepresentativeSnapshot | null {
  return extractRepresentativeSnapshot(raw);
}

export function mergeRepresentativeRowWithSnapshot(
  row: {
    rep_phone: string | null;
    rep_email: string | null;
    rep_avatar: string | null;
    rep_full_name: string | null;
    rep_title?: string | null;
  } | null,
  snapshot: RepresentativeSnapshot | null
): RepresentativeSnapshot {
  return {
    rep_full_name:
      firstNonEmptyString(row?.rep_full_name, snapshot?.rep_full_name) ??
      null,
    rep_title:
      firstNonEmptyString(row?.rep_title, snapshot?.rep_title) ?? null,
    rep_phone:
      firstNonEmptyString(row?.rep_phone, snapshot?.rep_phone) ?? null,
    rep_email:
      firstNonEmptyString(row?.rep_email, snapshot?.rep_email) ?? null,
    rep_avatar:
      firstNonEmptyString(row?.rep_avatar, snapshot?.rep_avatar) ?? null,
  };
}
