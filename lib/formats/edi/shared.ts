// Shared X12 810 segment/envelope builders reused by all four EDI variants.
//
// Envelope segments (ISA/GS/GE/IEA) and a handful of per-segment filler positions are
// treated as format boilerplate (constants + deterministically computed control
// numbers), never LLM-supplied — see the design doc's "variant constants" category.
//
// Segment element positions follow each variant's rules.md "Charted File Schema"
// table, with one correction applied uniformly: every real reference sample places
// the PID description at position 5 ("PID*F****<desc>~"), not position 10 as the
// chart text says — the chart entry looks like a copy/paste error, so the
// consistently-observed sample behavior is treated as authoritative here.

import type { ShipTo, SacCharge } from "../types";

export type { ShipTo, SacCharge };

const FINTECH_RECEIVER_ID = "616056461";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function spaces(n: number): string {
  return " ".repeat(n);
}

/** SAC/TDS amounts use implied-2-decimal integers (3300 = $33.00). */
export function impliedCents(amount: number): string {
  return String(Math.round(amount * 100));
}

/** Builds "TAG*el1*el2*...~", trimming trailing empty elements (matches real samples). */
export function buildSegment(tag: string, values: (string | undefined)[]): string {
  const trimmed = [...values];
  while (trimmed.length > 0 && !trimmed[trimmed.length - 1]) trimmed.pop();
  return [tag, ...trimmed.map((v) => v ?? "")].join("*") + "~";
}

export function bigSegment(opts: {
  invoiceDate: string;
  invoiceNumber: string;
  poDate?: string;
  poNumber?: string;
  refInvoiceNumber?: string;
  creditDebitIndicator?: "CR" | "DI";
}): string {
  const values: (string | undefined)[] = new Array(10);
  values[0] = opts.invoiceDate;
  values[1] = opts.invoiceNumber;
  values[2] = opts.poDate;
  values[3] = opts.poNumber;
  values[6] = opts.creditDebitIndicator;
  values[9] = opts.refInvoiceNumber;
  return buildSegment("BIG", values);
}

export function n1ShipToSegment(shipTo: ShipTo): string {
  return buildSegment("N1", ["ST", shipTo.name, "9", shipTo.vendorStoreId]);
}

export function n1ShipFromSegment(name: string, id: string): string {
  return buildSegment("N1", ["SF", name, "1", id]);
}

export function n1RemitSegment(interchangeId: string): string {
  return buildSegment("N1", ["RE", "", "9", interchangeId]);
}

export function n3Segment(shipTo: ShipTo): string {
  return buildSegment("N3", [shipTo.address1, shipTo.address2]);
}

export function n4Segment(shipTo: ShipTo): string {
  return buildSegment("N4", [shipTo.city, shipTo.state, shipTo.zip]);
}

export function itdSegment(dueDate?: string): string {
  const values: (string | undefined)[] = new Array(6);
  values[5] = dueDate;
  return buildSegment("ITD", values);
}

export const fobSegment = "FOB*PP~";

export function pidSegment(description: string): string {
  const values: (string | undefined)[] = new Array(5);
  values[0] = "F";
  values[4] = description;
  return buildSegment("PID", values);
}

export function sacSegment(charge: SacCharge): string {
  const values: (string | undefined)[] = new Array(15);
  values[0] = charge.indicator;
  values[1] = charge.code;
  values[4] = impliedCents(charge.amount);
  values[11] = "06";
  values[14] = charge.description;
  return buildSegment("SAC", values);
}

export function tdsSegment(invoiceTotal: number): string {
  return buildSegment("TDS", [impliedCents(invoiceTotal)]);
}

export function cttSegment(itemCount: number): string {
  return buildSegment("CTT", [String(itemCount)]);
}

/** Net signed amount for a line item: quantity * unitPrice, adjusted by A/C charges. */
export function lineItemNet(quantity: number, unitPrice: number, charges: SacCharge[] = []): number {
  const base = quantity * unitPrice;
  const chargeTotal = charges.reduce(
    (sum, c) => sum + (c.indicator === "A" ? -c.amount : c.amount),
    0
  );
  return base + chargeTotal;
}

export function buildTransactionSet(bodySegments: string[], controlNumber: string): string[] {
  const st = `ST*810*${controlNumber}~`;
  const se = buildSegment("SE", [String(bodySegments.length + 2), controlNumber]);
  return [st, ...bodySegments, se];
}

export type EnvelopeConfig = {
  isaQualifier: string;
  senderId: string;
  receiverQualifier: string;
  receiverId?: string;
  ackRequested: "0" | "1";
  groupSenderCode: string;
  /** Deterministic so render() stays a pure function; callers may vary this per batch. */
  interchangeControlNumber?: number;
  groupControlNumber?: number;
};

export function buildEnvelope(
  transactionSets: string[][],
  config: EnvelopeConfig,
  date: Date = new Date()
): string {
  const receiverId = config.receiverId ?? FINTECH_RECEIVER_ID;
  const interchangeControlNumber = config.interchangeControlNumber ?? 1;
  const groupControlNumber = config.groupControlNumber ?? 1;

  const yy = pad2(date.getFullYear() % 100);
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());

  const isa = [
    "ISA*00",
    spaces(10),
    "00",
    spaces(10),
    config.isaQualifier,
    config.senderId.padEnd(15).slice(0, 15),
    config.receiverQualifier,
    receiverId.padEnd(15).slice(0, 15),
    `${yy}${mm}${dd}`,
    `${hh}${min}`,
    "U",
    "00401",
    String(interchangeControlNumber).padStart(9, "0"),
    config.ackRequested,
    "P",
    ">",
  ].join("*") + "~";

  const gs = [
    "GS*IN",
    config.groupSenderCode,
    receiverId,
    `${date.getFullYear()}${mm}${dd}`,
    `${hh}${min}`,
    String(groupControlNumber),
    "X",
    "004010",
  ].join("*") + "~";

  const ge = `GE*${transactionSets.length}*${groupControlNumber}~`;
  const iea = `IEA*1*${String(interchangeControlNumber).padStart(9, "0")}~`;

  return [isa, gs, ...transactionSets.flat(), ge, iea].join("\n");
}
