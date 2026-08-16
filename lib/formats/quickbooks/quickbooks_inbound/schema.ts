import { z } from "zod";
import { usDateField } from "../../types";

/**
 * Represents one raw ledger row as it literally appears in the file — not a netted
 * line item. Real exports write the same product multiple times (with sign
 * inversions) as reversal entries; the whole point of this variant is being able to
 * generate that raw, pre-netting shape on request.
 */
export const qbInboundRowSchema = z.object({
  item: z.string().optional().describe("Vendor product number; sourced from itemDescription if omitted"),
  itemDescription: z.string().optional().describe("Product description; sourced from item if omitted"),
  qty: z.number().describe("Unit quantity as written in the raw ledger row (sign per the netting scenario being exercised)"),
  salesPrice: z.number(),
  upcCode: z.string().optional(),
});

export const qbInboundInvoiceSchema = z.object({
  transactionType: z.enum(["Invoice", "Credit Memo"]),
  date: usDateField(),
  num: z.string().describe("Invoice number"),
  sourceName: z.string().describe("Customer name and number (same value serves both)"),
  poNumber: z.string().optional(),
  dueDate: usDateField().optional(),
  rows: z.array(qbInboundRowSchema).min(1),
});

export const qbInboundSchema = z.array(qbInboundInvoiceSchema);
export type QbInboundInvoice = z.infer<typeof qbInboundInvoiceSchema>;
export type QbInboundRow = z.infer<typeof qbInboundRowSchema>;
