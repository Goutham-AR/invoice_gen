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
import type { Edi810Invoice, Edi810LineItem } from "./schema";

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

function it1Segment(li: Edi810LineItem, lineNumber: number): string {
  const values: (string | undefined)[] = new Array(11);
  values[0] = String(lineNumber);
  values[1] = String(li.quantity);
  values[2] = li.uom;
  values[3] = String(li.unitPrice);
  values[5] = li.upcPack ? "UP" : undefined;
  values[6] = li.upcPack;
  values[7] = li.upcCase ? "UP" : undefined;
  values[8] = li.upcCase;
  values[9] = "VN";
  values[10] = li.itemNumber;
  return buildSegment("IT1", values);
}

function po4Segment(li: Edi810LineItem): string | undefined {
  if (li.packsPerCase === undefined) return undefined;
  return buildSegment("PO4", [String(li.packsPerCase)]);
}

function lineItemSegments(li: Edi810LineItem, lineNumber: number): string[] {
  const segments = [it1Segment(li, lineNumber), pidSegment(li.description)];
  for (const charge of li.charges ?? []) segments.push(sacSegment(charge));
  const po4 = po4Segment(li);
  if (po4) segments.push(po4);
  return segments;
}

function invoiceTransactionSet(invoice: Edi810Invoice, controlNumber: string): string[] {
  const body: string[] = [
    bigSegment({
      invoiceDate: invoice.invoiceDate,
      invoiceNumber: invoice.invoiceNumber,
      poDate: invoice.poDate,
      poNumber: invoice.poNumber,
      refInvoiceNumber: invoice.refInvoiceNumber,
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
    (sum, li) => sum + lineItemNet(li.quantity, li.unitPrice, li.charges),
    0
  );
  body.push(tdsSegment(total), cttSegment(invoice.lineItems.length));

  return buildTransactionSet(body, controlNumber);
}

export function renderEdi810(invoices: Edi810Invoice[]): string {
  const transactionSets = invoices.map((inv, idx) => invoiceTransactionSet(inv, String(idx + 1)));
  return buildEnvelope(transactionSets, ENVELOPE_CONFIG);
}
