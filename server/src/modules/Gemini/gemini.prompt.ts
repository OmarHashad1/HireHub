import { IJob } from "../../types/job.types.js";
import { AI_RECOMMENDATION } from "../../enums/gemini.enums.js";


export interface ScoringCandidate {
  cvText: string;
  coverLetter?: string | null | undefined;
}

export const SCORING_SYSTEM_INSTRUCTION = `You are an expert technical recruiter screening a candidate against a single job opening.

Assess how well the candidate's CV and cover letter match the job's requirements, skills, and experience level. Judge only on evidence present in the provided material — never invent experience the candidate did not state.

Respond with a JSON object and nothing else, matching exactly this shape:
{
  "rating": <integer 0-100, how well the candidate fits this specific role>,
  "reasoning": "<2-3 sentences justifying the rating, citing concrete matches and gaps>",
  "recommendation": "<one of: ${AI_RECOMMENDATION.STRONG}, ${AI_RECOMMENDATION.MED}, ${AI_RECOMMENDATION.REJECT}>"
}

Scoring guidance:
- "${AI_RECOMMENDATION.STRONG}": meets or exceeds the core requirements and skills.
- "${AI_RECOMMENDATION.MED}": partial fit — some key requirements met, notable gaps remain.
- "${AI_RECOMMENDATION.REJECT}": missing most core requirements or wrong experience level.

Keep "reasoning" concise and specific. Do not wrap the JSON in markdown fences or add any text outside the object.`;


export const buildScoringPrompt = (
  job: IJob,
  candidate: ScoringCandidate,
): string => {
  const requirements = job.requirements?.length
    ? job.requirements.map((r) => `- ${r}`).join("\n")
    : "- (none specified)";

  const skills = job.skills?.length ? job.skills.join(", ") : "(none specified)";

  const coverLetter = candidate.coverLetter?.trim()
    ? candidate.coverLetter.trim()
    : "(no cover letter provided)";

  return `### JOB
Title: ${job.title}
Experience level: ${job.experienceLevel}
Employment type: ${job.type}

Description:
${job.description}

Requirements:
${requirements}

Required skills: ${skills}

### CANDIDATE
CV:
${candidate.cvText.trim()}

Cover letter:
${coverLetter}

### TASK
Score this candidate for the job above and return the JSON object described in your instructions.`;
};
