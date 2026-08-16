import OpenAI from "openai";

let client: OpenAI | null = null;

/** Lazily-constructed client so a missing env var only fails when generation is actually attempted. */
export function getLlmClient(): OpenAI {
  if (client) return client;

  const baseURL = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY ?? "unused";

  if (!baseURL) {
    throw new Error(
      "OPENAI_BASE_URL is not set. Point it at your self-hosted OpenAI-compatible server."
    );
  }

  client = new OpenAI({ baseURL, apiKey });
  return client;
}

export function getLlmModel(): string {
  const model = process.env.OPENAI_MODEL;
  if (!model) {
    throw new Error("OPENAI_MODEL is not set.");
  }
  return model;
}
