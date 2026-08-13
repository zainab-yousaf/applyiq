import OpenAI from "openai";

let client: OpenAI | null = null;

export function getAIClient() {
  if (!client) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Add it to .env.local (see .env.local.example).",
      );
    }
    client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/zainab-yousaf/applyiq",
        "X-Title": "ApplyIQ",
      },
    });
  }
  return client;
}

export const MODEL = "anthropic/claude-sonnet-4.5";
