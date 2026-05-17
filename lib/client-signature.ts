/** Stored on `quotes.signature_payload` after client signs. */
export type ClientSignaturePayload = {
  signerName?: string;
  companyName?: string;
  companyReg?: string;
  /** `data:image/png;base64,...` from canvas */
  imagePngDataUrl?: string;
};

export function parseClientSignaturePayload(
  raw: unknown
): ClientSignaturePayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const str = (k: string) =>
    typeof o[k] === "string" ? (o[k] as string) : undefined;
  return {
    signerName: str("signerName"),
    companyName: str("companyName"),
    companyReg: str("companyReg"),
    imagePngDataUrl: str("imagePngDataUrl"),
  };
}
