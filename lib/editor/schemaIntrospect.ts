import { z } from "zod";

/** Strips a ZodOptional wrapper (the only wrapper our schemas use) and reports whether it was present. */
export function unwrapOptional(schema: z.ZodTypeAny): { inner: z.ZodTypeAny; optional: boolean } {
  if (schema instanceof z.ZodOptional) {
    return { inner: schema.unwrap() as z.ZodTypeAny, optional: true };
  }
  return { inner: schema, optional: false };
}

/**
 * A concrete default value for a schema, suitable for a freshly-added array row/invoice
 * or for an optional field the user just chose to add. `forceRequired` makes the *top*
 * call ignore optionality (so "add this row" always produces a full object); nested
 * optional fields within it still default to absent, matching the mandatory-only rule.
 */
export function defaultValue(schema: z.ZodTypeAny, forceRequired = false): unknown {
  const { inner, optional } = unwrapOptional(schema);
  if (optional && !forceRequired) return undefined;

  if (inner instanceof z.ZodEnum) {
    return inner.options[0];
  }
  if (inner instanceof z.ZodString) return "";
  if (inner instanceof z.ZodNumber) return 0;
  if (inner instanceof z.ZodBoolean) return false;
  if (inner instanceof z.ZodArray) return [];
  if (inner instanceof z.ZodObject) {
    const shape = inner.shape as Record<string, z.ZodTypeAny>;
    const obj: Record<string, unknown> = {};
    for (const key of Object.keys(shape)) {
      obj[key] = defaultValue(shape[key]);
    }
    return obj;
  }
  return "";
}

/** "quantityShipped" -> "Quantity Shipped" — fallback label when no FieldMeta entry matches. */
export function humanize(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function enumOptions(schema: z.ZodTypeAny): string[] | null {
  const { inner } = unwrapOptional(schema);
  if (inner instanceof z.ZodEnum) {
    return inner.options as string[];
  }
  return null;
}
