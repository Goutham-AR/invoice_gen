import { z } from "zod";
import { usDateField } from "../../types";

export const csv24LineItemSchema = z.object({
  quantityShipped: z
    .number()
    .describe(
      "Quantity shipped, up to 2 decimals. Negative is the standard indicator for a credit/return line."
    ),
  uom: z
    .enum(["BO", "EA", "CA", "KE", "DS"])
    .describe("Quantity shipped unit of measure"),
  itemNumber: z.string().max(20).describe("Vendor product number"),
  upcPack: z.string().max(12).optional().describe("Pack UPC, 12 digits preferred"),
  upcCase: z.string().max(12).optional().describe("Case UPC, 12 digits preferred"),
  gtinId: z.string().max(14).optional().describe("Global Trade Item Number"),
  description: z.string().max(80).describe("Product description"),
  unitPrice: z
    .number()
    .describe(
      "Unit price, up to 4 decimals. A negative value is a nonstandard, but accepted, credit/return indicator."
    ),
  promotionalDiscount: z.number().optional().describe("Per-line promo discount amount (SAC F810)"),
  stateTax: z.number().optional().describe("Per-line state tax amount (SAC H850)"),
  depositAmount: z.number().optional().describe("Per-line deposit amount (SAC C110)"),
  miscellaneousCharge: z.number().optional().describe("Per-line misc. charge (SAC I131)"),
  extendedPrice: z
    .number()
    .optional()
    .describe("Extended price; omit to let it be calculated as quantity * unit price"),
  packsPerCase: z.number().optional(),
  countyTax: z.number().optional().describe("Per-line county tax amount (SAC H730)"),
  cityTax: z.number().optional().describe("Per-line city tax amount (SAC H630)"),
});

export const csv24InvoiceSchema = z.object({
  divisionId: z.string().describe("Vendor FTS id"),
  invoiceNumber: z.string().max(22),
  invoiceDate: usDateField(),
  vendorStoreId: z.string().max(80).describe("Retailer customer id"),
  invoiceDueDate: usDateField("Defaults to invoiceDate if omitted").optional(),
  poNumber: z.string().max(22).optional(),
  poDate: usDateField().optional(),
  refInvoiceNumber: z.string().max(22).optional(),
  lineItems: z.array(csv24LineItemSchema).min(1),
});

export const csv24Schema = z.array(csv24InvoiceSchema);
export type Csv24Invoice = z.infer<typeof csv24InvoiceSchema>;
export type Csv24LineItem = z.infer<typeof csv24LineItemSchema>;
