import { z } from "zod";
import { ediDateField, shipToFields, sacChargeFields } from "../../types";

export const edi810LineItemSchema = z.object({
  quantity: z.number().describe("Negative = standard indicator for a credit/return line (IT102)"),
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

export const edi810InvoiceSchema = z.object({
  invoiceDate: ediDateField(),
  invoiceNumber: z.string().max(18),
  poDate: ediDateField().optional(),
  poNumber: z.string().optional(),
  refInvoiceNumber: z.string().optional(),
  dueDate: ediDateField().optional(),
  shipTo: shipToFields(),
  lineItems: z.array(edi810LineItemSchema).min(1),
});

export const edi810Schema = z.array(edi810InvoiceSchema);
export type Edi810Invoice = z.infer<typeof edi810InvoiceSchema>;
export type Edi810LineItem = z.infer<typeof edi810LineItemSchema>;
