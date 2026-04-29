export type QuoteLineInput = {
  qty: number;
  unitPrice: number;
  unitDiscount: number;
};

export type QuoteTotalsBreakdown = {
  /** Sum of line totals before quote-level discount — shown as סה״כ ללא מע״מ */
  lineSubtotal: number;
  /** Percentage 0–100 from quote.special_discount */
  specialDiscountPercent: number;
  /** ₪ amount deducted (lineSubtotal × percent / 100) */
  specialDiscountAmount: number;
  /** Base for VAT: lineSubtotal − specialDiscountAmount */
  afterSpecial: number;
  vatAmount: number;
  total: number;
};

/**
 * Line sums, then quote-level special discount as **percentage** of line subtotal, then VAT on the remainder.
 */
export function calculateQuoteBreakdown(params: {
  vat: number;
  /** Percentage (e.g. 10 = 10%). Applied to line subtotal before VAT. */
  specialDiscount: number;
  lines: QuoteLineInput[];
}): QuoteTotalsBreakdown {
  const lineSubtotal = params.lines.reduce(
    (sum, line) =>
      sum +
      line.qty *
        (Number(line.unitPrice) - Number(line.unitDiscount)),
    0
  );
  const pct = Math.max(0, Number(params.specialDiscount));
  const specialDiscountAmount =
    pct > 0 ? lineSubtotal * (pct / 100) : 0;
  const afterSpecial = lineSubtotal - specialDiscountAmount;
  const vatRate = Number(params.vat) / 100;
  const vatAmount = afterSpecial * vatRate;
  const total = afterSpecial + vatAmount;
  return {
    lineSubtotal,
    specialDiscountPercent: pct,
    specialDiscountAmount,
    afterSpecial,
    vatAmount,
    total,
  };
}
