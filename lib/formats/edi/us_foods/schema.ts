import { z } from "zod";
import { ediDateField, shipToFields, sacChargeFields } from "../../types";

/** US Foods' expanded SAC code set, layered on top of the standard codes. */
export const usFoodsSacCode = z.enum([
  "A170",
  "B950",
  "C040",
  "C650",
  "D240",
  "F340",
  "F800",
  "G970",
  "H625",
  "H840",
  "H850",
  "C110",
  "F810",
]);

export const usFoodsLineItemSchema = z.object({
  quantity: z
    .number()
    .describe(
      "Negative on credit lines. For LB UOM this may be a decimal (e.g. 38.63)."
    ),
  uom: z.enum(["CA", "EA", "LB"]).describe("LB (pound) is US Foods-specific"),
  unitPrice: z.number(),
  basisOfUnitPriceCode: z.enum(["PE", "PP", "UM"]).optional(),
  upcPack: z.string().optional(),
  upcCase: z.string().optional(),
  itemNumber: z.string().describe("VIN item number"),
  manufacturerPartNumber: z.string().optional(),
  substituteProductNumber: z.string().optional(),
  brandLabel: z.string().optional(),
  description: z.string(),
  lineTax: z
    .object({ amount: z.number() })
    .optional()
    .describe("Line-item net tax (TXI, mapped to SAC code H850)"),
  charges: z
    .array(sacChargeFields().extend({ code: usFoodsSacCode }))
    .optional()
    .describe("Line-item SAC allowance/charge records, using US Foods' expanded code set"),
});

export const usFoodsInvoiceSchema = z.object({
  invoiceDate: ediDateField(),
  invoiceNumber: z.string().max(18),
  poDate: ediDateField().optional(),
  poNumber: z.string().optional(),
  creditDebitIndicator: z
    .enum(["CR", "DI"])
    .optional()
    .describe("BIG07: principal credit(CR)/debit(DI) indicator for this invoice"),
  dueDate: ediDateField().optional(),
  shipTo: shipToFields(),
  lineItems: z.array(usFoodsLineItemSchema).min(1),
  summaryTax: z
    .object({
      type: z.enum(["LS", "TX"]).describe("LS = state/local sales tax (loadable); TX = reference-only total"),
      amount: z.number(),
      percent: z.number().optional(),
    })
    .optional(),
});

export const usFoodsSchema = z.array(usFoodsInvoiceSchema);
export type UsFoodsInvoice = z.infer<typeof usFoodsInvoiceSchema>;
export type UsFoodsLineItem = z.infer<typeof usFoodsLineItemSchema>;
