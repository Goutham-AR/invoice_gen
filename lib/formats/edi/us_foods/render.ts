import {
  bigSegment,
  n1ShipToSegment,
  n1ShipFromSegment,
  n1RemitSegment,
  n3Segment,
  n4Segment,
  itdSegment,
  fobSegment,
  pidSegment,
  sacSegment,
  tdsSegment,
  cttSegment,
  buildSegment,
  buildTransactionSet,
  buildEnvelope,
  lineItemNet,
  type EnvelopeConfig,
} from "../shared";
import type { UsFoodsInvoice, UsFoodsLineItem } from "./schema";

const SHIP_FROM_NAME = "Blue Bell Creameries, LP";
const SHIP_FROM_ID = "8388";
const REMIT_INTERCHANGE_ID = "GOODYGOODY";

const ENVELOPE_CONFIG: EnvelopeConfig = {
  isaQualifier: "14",
  senderId: "7385",
  receiverQualifier: "01",
  ackRequested: "0",
  groupSenderCode: SHIP_FROM_ID,
};

function it1Segment(li: UsFoodsLineItem, lineNumber: number): string {
  const values: (string | undefined)[] = new Array(23);
  values[0] = String(lineNumber);
  values[1] = String(li.quantity);
  values[2] = li.uom;
  values[3] = String(li.unitPrice);
  values[4] = li.basisOfUnitPriceCode;
  values[5] = li.upcPack ? "VN" : undefined;
  values[6] = li.upcPack;
  values[7] = li.upcCase ? "IN" : undefined;
  values[8] = li.upcCase;
  values[9] = "UK";
  values[10] = li.itemNumber;
  values[11] = li.manufacturerPartNumber ? "MG" : undefined;
  values[12] = li.manufacturerPartNumber;
  values[13] = li.substituteProductNumber ? "SR" : undefined;
  values[14] = li.substituteProductNumber;
  values[21] = li.brandLabel ? "BL" : undefined;
  values[22] = li.brandLabel;
  return buildSegment("IT1", values);
}

function lineTxiSegment(li: UsFoodsLineItem): string | undefined {
  if (!li.lineTax) return undefined;
  return buildSegment("TXI", ["H850", String(li.lineTax.amount)]);
}

function summaryTxiSegment(invoice: UsFoodsInvoice): string | undefined {
  if (!invoice.summaryTax) return undefined;
  const { type, amount, percent } = invoice.summaryTax;
  return buildSegment("TXI", [type, String(amount), percent !== undefined ? String(percent) : undefined]);
}

function lineItemSegments(li: UsFoodsLineItem, lineNumber: number): string[] {
  const segments = [it1Segment(li, lineNumber), pidSegment(li.description)];
  const txi = lineTxiSegment(li);
  if (txi) segments.push(txi);
  for (const charge of li.charges ?? []) segments.push(sacSegment(charge));
  return segments;
}

function invoiceTransactionSet(invoice: UsFoodsInvoice, controlNumber: string): string[] {
  const body: string[] = [
    bigSegment({
      invoiceDate: invoice.invoiceDate,
      invoiceNumber: invoice.invoiceNumber,
      poDate: invoice.poDate,
      poNumber: invoice.poNumber,
      creditDebitIndicator: invoice.creditDebitIndicator,
    }),
    n1ShipToSegment(invoice.shipTo),
    n1ShipFromSegment(SHIP_FROM_NAME, SHIP_FROM_ID),
    n3Segment(invoice.shipTo),
    n4Segment(invoice.shipTo),
    n1RemitSegment(REMIT_INTERCHANGE_ID),
    itdSegment(invoice.dueDate),
    fobSegment,
  ];

  invoice.lineItems.forEach((li, idx) => body.push(...lineItemSegments(li, idx + 1)));

  const total = invoice.lineItems.reduce(
    (sum, li) =>
      sum +
      lineItemNet(li.quantity, li.unitPrice, li.charges) +
      (li.lineTax?.amount ?? 0),
    0
  );
  body.push(tdsSegment(total));

  const summaryTxi = summaryTxiSegment(invoice);
  if (summaryTxi) body.push(summaryTxi);

  body.push(cttSegment(invoice.lineItems.length));

  return buildTransactionSet(body, controlNumber);
}

export function renderUsFoods(invoices: UsFoodsInvoice[]): string {
  const transactionSets = invoices.map((inv, idx) => invoiceTransactionSet(inv, String(idx + 1)));
  return buildEnvelope(transactionSets, ENVELOPE_CONFIG);
}
