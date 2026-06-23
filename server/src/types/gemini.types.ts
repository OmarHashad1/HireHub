import { AI_RECOMMENDATION } from "../enums/gemini.enums.js";

export interface AIScoreResult {
  rating: number;
  reasoning: string;
  recommendation: AI_RECOMMENDATION;
}
