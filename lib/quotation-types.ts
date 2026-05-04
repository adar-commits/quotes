type QuotationPayloadCore = {
  vat: number;
  customer?: {
    customerID: string;
    customerName: string;
    customerAddress: string;
  };
  products: Array<{
    Qty: number;
    SKU: string;
    color: string | null;
    shape: string | null;
    material: string | null;
    technique: string | null;
    unitPrice: number;
    unitDiscount: number;
    pictureurl: string;
    productDesc: string;
    additionalDesc: string | null;
  }>;
  agentCode: string | null;
  agentDesc: string | null;
  invoiceID: string;
  projectName: string;
  quotationID: string;
  paymentsTerms: string[];
  Representative: {
    repPhone: string;
    repEmail?: string | null;
    repAvatar: string;
    repFullName: string;
  };
  specialDiscount: number;
  requireSignature: boolean;
  invoiceCreationDate: string;
  /** Use `template_id` for the row UUID, or `template_key` for the slug (redcarpet | pozitive | elite_rugs). A UUID may also be sent as `template_key` and will resolve by id. */
  template_id?: string | null;
  template_key?: string | null;
};

/** `POST /api/quotes` merges root + nested `customer` into DB columns. Accepted aliases include camelCase, snake_case, PascalCase (`CustomerName`, `CompanyName`), nested `name` / `Name`, and a root-level string `customer` (company name). */
export type QuotationPayload = QuotationPayloadCore & {
  customerID?: string;
  customerName?: string;
  customerAddress?: string;
};
