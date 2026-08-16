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
import type { EncompassInvoice, EncompassLineItem } from "./schema";

const SHIP_FROM_NAME = "Test demos comp";
const SHIP_FROM_ID = "10000356";
const REMIT_INTERCHANGE_ID = "GOODYGOODY";

const ENVELOPE_CONFIG: EnvelopeConfig = {
  isaQualifier: "ZZ",
  senderId: "00001546",
  receiverQualifier: "ZZ",
  ackRequested: "1",
  groupSenderCode: "00001546",
};

/** Encompass writes IT102/IT104 zero-padded to 3 decimals (e.g. "6.000" = 6). */
function fixed3(n: number): string {
  return n.toFixed(3);
}

function it1Segment(li: EncompassLineItem, lineNumber: number): string {
  const values: (string | undefined)[] = new Array(11);
  values[0] = String(lineNumber);
  values[1] = fixed3(li.quantity);
  values[2] = li.uom;
  values[3] = fixed3(li.unitPrice);
  values[5] = li.upcPack ? "UP" : undefined;
  values[6] = li.upcPack;
  values[7] = li.upcCase ? "UP" : undefined;
  values[8] = li.upcCase;
  values[9] = "VN";
  values[10] = li.itemNumber;
  return buildSegment("IT1", values);
}

function po4Segment(li: EncompassLineItem): string | undefined {
  if (li.packsPerCase === undefined && li.lineItemCost === undefined) return undefined;
  return buildSegment("PO4", [
    li.packsPerCase !== undefined ? String(li.packsPerCase) : undefined,
    li.lineItemCost !== undefined ? String(li.lineItemCost) : undefined,
  ]);
}

function lineItemSegments(li: EncompassLineItem, lineNumber: number): string[] {
  const segments = [it1Segment(li, lineNumber), pidSegment(li.description)];
  for (const charge of li.charges ?? []) segments.push(sacSegment(charge));
  const po4 = po4Segment(li);
  if (po4) segments.push(po4);
  return segments;
}

function invoiceTransactionSet(invoice: EncompassInvoice, controlNumber: string): string[] {
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

export function renderEncompass(invoices: EncompassInvoice[]): string {
  const transactionSets = invoices.map((inv, idx) => invoiceTransactionSet(inv, String(idx + 1)));
  return buildEnvelope(transactionSets, ENVELOPE_CONFIG);
}
