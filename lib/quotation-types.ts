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
    repAvatar: string;
    repFullName: string;
  };
  specialDiscount: number;
  requireSignature: boolean;
  invoiceCreationDate: string;
  /** Template id (uuid) or template_key (e.g. 'redcarpet' | 'pozitive' | 'elite_rugs') for theming */
  template_id?: string | null;
  template_key?: string | null;
};

/** `POST /api/quotes` accepts the same `customer` fields at the top level (e.g. `customerName` next to `vat`); they merge with `customer` when the nested value is empty. */
export type QuotationPayload = QuotationPayloadCore & {
  customerID?: string;
  customerName?: string;
  customerAddress?: string;
};
