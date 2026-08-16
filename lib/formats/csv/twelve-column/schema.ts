import { z } from "zod";
import { usDateField } from "../../types";

export const csv12LineItemSchema = z.object({
  quantityShipped: z
    .number()
    .describe(
      "Quantity shipped, up to 2 decimals. Negative is the standard indicator for a credit/return line."
    ),
  uom: z
    .enum(["BO", "EA", "CA", "KE", "DS"])
    .describe("Quantity shipped unit of measure"),
  itemNumber: z.string().max(20).describe("Vendor product number"),
  description: z.string().max(80).describe("Product description"),
  unitPrice: z
    .number()
    .describe(
      "Unit price, up to 4 decimals. A negative value is a nonstandard, but accepted, credit/return indicator."
    ),
});

export const csv12InvoiceSchema = z.object({
  divisionId: z.string().describe("Vendor FTS id"),
  invoiceNumber: z.string().max(22),
  invoiceDate: usDateField(),
  vendorStoreId: z.string().max(80).describe("Retailer customer id"),
  invoiceDueDate: usDateField("Defaults to invoiceDate if omitted").optional(),
  poNumber: z.string().max(22).optional(),
  poDate: usDateField().optional(),
  lineItems: z.array(csv12LineItemSchema).min(1),
});

export const csv12Schema = z.array(csv12InvoiceSchema);
export type Csv12Invoice = z.infer<typeof csv12InvoiceSchema>;
export type Csv12LineItem = z.infer<typeof csv12LineItemSchema>;
