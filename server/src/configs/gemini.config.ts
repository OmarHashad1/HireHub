import { GenerateContentParameters, GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "./env.config.js";

class Gemini {
  private client: GoogleGenAI;
  constructor() {
    this.client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async generateWithRetry(
    params: GenerateContentParameters,
    retries: number = 3,
  ) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.client.models.generateContent(params);
      } catch (err: any) {
        const status = err?.status ?? err?.error?.code;
        const retryable = status === 503 || status === 429 || status === 500;
        if (!retryable || attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
      }
    }
    return;
  }
}
export const geminiClient = new Gemini();
