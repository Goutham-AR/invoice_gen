import { z } from "zod";
import { usDateField } from "../../types";

/**
 * Represents one raw ledger row as it literally appears in the file — not a netted
 * line item; see quickbooks_inbound for why (same duplicate/reversal-row netting
 * behavior applies here).
 */
export const qbOnlineRowSchema = z.object({
  description: z
    .string()
    .describe("Memo/Description: serves as both vendor product number and product description"),
  qty: z.number().describe("Raw ledger row quantity; may repeat with inverted sign for netting scenarios"),
  rate: z.number(),
  upcCode: z.string().optional(),
});

export const qbOnlineInvoiceSchema = z.object({
  transactionType: z.enum(["Invoice", "Credit Memo"]),
  date: usDateField(),
  num: z.string().describe("Invoice number"),
  name: z.string().describe("Customer name and number (same value serves both)"),
  poNumber: z.string().optional(),
  dueDate: usDateField().optional(),
  rows: z.array(qbOnlineRowSchema).min(1),
});

export const qbOnlineSchema = z.array(qbOnlineInvoiceSchema);
export type QbOnlineInvoice = z.infer<typeof qbOnlineInvoiceSchema>;
export type QbOnlineRow = z.infer<typeof qbOnlineRowSchema>;
