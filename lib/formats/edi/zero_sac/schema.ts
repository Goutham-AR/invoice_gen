import { z } from "zod";
import { ediDateField, shipToFields, sacChargeFields } from "../../types";

export const zeroSacLineItemSchema = z.object({
  quantity: z
    .number()
    .describe(
      "Negative = standard credit/return indicator. Zero is a valid, meaningful test value here: " +
        "downstream ingestion should load a zero-quantity line as quantity 1 / price 0.00."
    ),
  uom: z.enum(["EA", "BO", "CA", "KE", "DS"]),
  unitPrice: z.number().describe("Negative = nonstandard, but accepted, credit/return indicator (IT104)"),
  upcPack: z.string().optional(),
  upcCase: z.string().optional(),
  itemNumber: z.string().describe("Distributor SKU (vendor product number)"),
  description: z.string(),
  packsPerCase: z.number().optional(),
  charges: z
    .array(sacChargeFields())
    .optional()
    .describe("Line-item SAC allowance/charge records"),
});

export const zeroSacInvoiceSchema = z.object({
  invoiceDate: ediDateField(),
  invoiceNumber: z.string().max(18),
  poDate: ediDateField().optional(),
  poNumber: z.string().optional(),
  refInvoiceNumber: z.string().optional(),
  dueDate: ediDateField().optional(),
  shipTo: shipToFields(),
  lineItems: z.array(zeroSacLineItemSchema).min(1),
});

export const zeroSacSchema = z.array(zeroSacInvoiceSchema);
export type ZeroSacInvoice = z.infer<typeof zeroSacInvoiceSchema>;
export type ZeroSacLineItem = z.infer<typeof zeroSacLineItemSchema>;
