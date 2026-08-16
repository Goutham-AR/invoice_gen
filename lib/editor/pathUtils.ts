export type PathKey = string | number;

/** Immutably sets a value at a data path (array of real keys/indices), cloning along the way. */
export function setAt(obj: unknown, path: PathKey[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;

  if (typeof head === "number") {
    const arr = Array.isArray(obj) ? [...obj] : [];
    arr[head] = setAt(arr[head], rest, value);
    return arr;
  }

  const record = obj && typeof obj === "object" ? { ...(obj as Record<string, unknown>) } : {};
  record[head] = setAt(record[head], rest, value);
  return record;
}

/** Immutably deletes the key/index at the given path (used to "unset" an optional field). */
export function removeAt(obj: unknown, path: PathKey[]): unknown {
  if (path.length === 0) return obj;
  const [head, ...rest] = path;

  if (rest.length === 0) {
    if (typeof head === "number") {
      if (!Array.isArray(obj)) return obj;
      const arr = [...obj];
      arr.splice(head, 1);
      return arr;
    }
    if (!obj || typeof obj !== "object") return obj;
    const record = { ...(obj as Record<string, unknown>) };
    delete record[head];
    return record;
  }

  if (typeof head === "number") {
    if (!Array.isArray(obj)) return obj;
    const arr = [...obj];
    arr[head] = removeAt(arr[head], rest);
    return arr;
  }
  if (!obj || typeof obj !== "object") return obj;
  const record = { ...(obj as Record<string, unknown>) };
  record[head] = removeAt(record[head], rest);
  return record;
}
