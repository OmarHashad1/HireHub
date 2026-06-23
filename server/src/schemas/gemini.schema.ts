import { z } from "zod";
import { AI_RECOMMENDATION } from "../enums/gemini.enums.js";

export const aiScoreSchema = z.object({
  rating: z.number().int().min(0).max(100),
  reasoning: z.string().min(1).max(2000),
  recommendation: z.enum([...Object.values(AI_RECOMMENDATION)]),
});

export type aiScoreDTO = z.infer<typeof aiScoreSchema>;
