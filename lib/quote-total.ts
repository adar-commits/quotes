export type QuoteLineInput = {
  qty: number;
  unitPrice: number;
  unitDiscount: number;
};

export type QuoteTotalsBreakdown = {
  subtotal: number;
  afterDiscount: number;
  vatAmount: number;
  total: number;
};

/** Same logic as the public quote page: line sums, special discount, then VAT. */
export function calculateQuoteBreakdown(params: {
  vat: number;
  specialDiscount: number;
  lines: QuoteLineInput[];
}): QuoteTotalsBreakdown {
  const subtotal = params.lines.reduce(
    (sum, line) =>
      sum +
      line.qty *
        (Number(line.unitPrice) - Number(line.unitDiscount)),
    0
  );
  const afterDiscount = subtotal - Number(params.specialDiscount);
  const vatRate = Number(params.vat) / 100;
  const vatAmount = afterDiscount * vatRate;
  const total = afterDiscount + vatAmount;
  return { subtotal, afterDiscount, vatAmount, total };
}
