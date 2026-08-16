import { z } from "zod";
import { ediDateField, shipToFields, sacChargeFields } from "../../types";

export const encompassLineItemSchema = z.object({
  quantity: z.number().describe("Negative = standard indicator for a credit/return line (IT102)"),
  uom: z.enum(["EA", "BO", "CA", "KE", "DS"]),
  unitPrice: z.number().describe("Negative = nonstandard, but accepted, credit/return indicator (IT104)"),
  upcPack: z.string().optional(),
  upcCase: z.string().optional(),
  itemNumber: z.string().describe("Distributor SKU (vendor product number)"),
  description: z.string(),
  packsPerCase: z.number().optional(),
  lineItemCost: z
    .number()
    .optional()
    .describe(
      "PO402 reconciliation value: Encompass's own extended-cost total for this line, used to verify IT102*IT104 when price carries extra decimal precision"
    ),
  charges: z
    .array(sacChargeFields())
    .optional()
    .describe("Line-item SAC allowance/charge records"),
});

export const encompassInvoiceSchema = z.object({
  invoiceDate: ediDateField(),
  invoiceNumber: z.string().max(18),
  poDate: ediDateField().optional(),
  poNumber: z.string().optional(),
  refInvoiceNumber: z.string().optional(),
  dueDate: ediDateField().optional(),
  shipTo: shipToFields(),
  lineItems: z.array(encompassLineItemSchema).min(1),
});

export const encompassSchema = z.array(encompassInvoiceSchema);
export type EncompassInvoice = z.infer<typeof encompassInvoiceSchema>;
export type EncompassLineItem = z.infer<typeof encompassLineItemSchema>;
