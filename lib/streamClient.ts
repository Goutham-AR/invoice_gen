export type StreamLine =
  | { type: "record"; record: unknown; records: unknown[]; renderedText: string }
  | { type: "done"; records: unknown[]; renderedText: string }
  | { type: "error"; message: string };

/** Reads a newline-delimited JSON response body, invoking onLine for each parsed line as it arrives. */
export async function consumeNdjson(response: Response, onLine: (line: StreamLine) => void): Promise<void> {
  if (!response.body) throw new Error("Response has no body to stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) onLine(JSON.parse(line) as StreamLine);
    }
  }

  const trailing = buffer.trim();
  if (trailing) onLine(JSON.parse(trailing) as StreamLine);
}
