import { z } from "zod";

export type FieldScope = "header" | "lineItem" | "charge";

export type FieldMeta = {
  /** Path into the invoice/line-item object, e.g. "lineItems[].unitPrice". */
  key: string;
  /** Display column/segment name, matching the source rules.md charted schema. */
  label: string;
  /** Display data type string, as written in the charted schema. */
  dataType: string;
  mandatory: boolean;
  scope: FieldScope;
  example?: string;
  notes?: string;
};

export type FormatType = "csv" | "edi" | "quickbooks";

export type FormatMeta = {
  id: string;
  formatType: FormatType;
  label: string;
  description: string;
  fileExtension: string;
};

/**
 * The fs-free subset of a variant module: safe to import from client components,
 * since it never touches rules.md/sample content on disk. Drives the variant
 * selector, the structured edit form, and instant client-side re-rendering.
 */
export type ClientFormatModule<TInvoice = unknown> = FormatMeta & {
  /** Validates the LLM's structured output: an array of invoices for this variant. */
  schema: z.ZodType<TInvoice[]>;
  /** Single source of truth for the LLM schema doc, docs table, and edit form. */
  fields: FieldMeta[];
  /** Deterministic: structured data in, exact target file text out. */
  render: (invoices: TInvoice[]) => string;
};

/** Full module, only ever imported server-side (API routes, docs pages) since it reads files. */
export type FormatModule<TInvoice = unknown> = ClientFormatModule<TInvoice> & {
  /** Business rules injected into the LLM system prompt (the variant's rules.md). */
  promptGuidance: string;
  /** Reference sample file content, shown on the docs page. */
  sample: string;
};

// ---- Shared Zod fragments, reused by variant schemas without forcing one universal schema ----

/** M/DD/YYYY style US date, used by CSV / QuickBooks variants. */
export const usDateField = (description = "Date in M/DD/YYYY format") =>
  z
    .string()
    .regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/, "Expected M/DD/YYYY date")
    .describe(description);

/** YYYYMMDD date used inside EDI BIG/ITD segments. */
export const ediDateField = (description = "Date in YYYYMMDD format") =>
  z
    .string()
    .regex(/^\d{8}$/, "Expected YYYYMMDD date")
    .describe(description);

/** Decimal monetary/quantity amount. Renderer handles implied-decimal / rounding rules. */
export const moneyField = (description = "Decimal amount") =>
  z.number().describe(description);

export const shipToFields = () =>
  z.object({
    name: z.string().describe("Ship-to / customer location name"),
    vendorStoreId: z.string().describe("Retailer customer / store id"),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  });

export type ShipTo = z.infer<ReturnType<typeof shipToFields>>;

/** SAC-style allowance/charge line used by every EDI variant and the 24-col CSV. */
export const sacChargeFields = () =>
  z.object({
    indicator: z.enum(["A", "C"]).describe("A = allowance (subtract), C = charge (add)"),
    code: z.string().describe("4-character SAC charge code, e.g. C110, F810, H850"),
    description: z.string().optional(),
    amount: z.number().describe("Charge amount (positive; indicator controls sign)"),
  });

export type SacCharge = z.infer<ReturnType<typeof sacChargeFields>>;
