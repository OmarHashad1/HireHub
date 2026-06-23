import { IApplication } from "../../types/application.types.js";
import { APPLICATION_STATUS } from "../../enums/application.enums.js";
import { IJob } from "../../types/job.types.js";
import { geminiClient } from "../../configs/gemini.config.js";
import { getAsset } from "../../utils/s3.util.js";
import { InternalServerErrorException } from "../../utils/errorHandler.util.js";
import { parserPDF } from "../../utils/pdfParser.util.js";
import { aiScoreDTO, aiScoreSchema } from "../../schemas/gemini.schema.js";
import { GEMINI_MODEL } from "../../configs/env.config.js";
import {
  buildScoringPrompt,
  SCORING_SYSTEM_INSTRUCTION,
} from "./gemini.prompt.js";
import { GenerateContentResponse, Type } from "@google/genai";
import { ApplicationRepo } from "../../repositories/application.repo.js";
import { activityLogger, serverLogger } from "../../utils/logger.util.js";
import { LOG_ACTION, LOG_TARGET_TYPE } from "../../enums/log.enums.js";
import {
  notificationEmitter,
  NOTIFICATION_EVENTS,
} from "../../events/notification.events.js";
import { AI_RECOMMENDATION } from "../../enums/gemini.enums.js";

type geminiResponse = GenerateContentResponse | undefined;
const applicationRepo = new ApplicationRepo();


const responseSchema = {
  type: Type.OBJECT,
  properties: {
    rating: { type: Type.INTEGER },
    reasoning: { type: Type.STRING },
    recommendation: {
      type: Type.STRING,
      enum: Object.values(AI_RECOMMENDATION),
    },
  },
  required: ["rating", "reasoning", "recommendation"],
};
export const scoreApplication = async (
  job: IJob,
  application: IApplication,
) => {
  const applicantCvKey = application.cv;
  const cvUrl = await getAsset({ Key: applicantCvKey });
  if (!cvUrl) throw new InternalServerErrorException("Can't fetch cv Url");
  const cvText = await parserPDF(cvUrl);

  const rawResponse: geminiResponse = await geminiClient.generateWithRetry({
    model: GEMINI_MODEL,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      systemInstruction: SCORING_SYSTEM_INSTRUCTION,
    },
    contents: [
      buildScoringPrompt(job, { cvText, coverLetter: application.coverLetter }),
    ],
  });

  if (!rawResponse?.text)
    throw new InternalServerErrorException("AI returned no response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawResponse.text);
  } catch (err) {
    serverLogger.error(
      {
        applicationId: application._id,
        jobId: job._id,
        raw: rawResponse.text,
        err,
      },
      "AI response was not valid JSON",
    );
    throw new InternalServerErrorException("Invalid AI score");
  }

  const result = aiScoreSchema.safeParse(parsed);
  if (!result.success) {
    serverLogger.error(
      {
        applicationId: application._id,
        jobId: job._id,
        raw: rawResponse.text,
        err: result.error,
      },
      "AI score failed schema validation",
    );
    throw new InternalServerErrorException("Invalid AI score");
  }

  const aiScoring: aiScoreDTO = result.data;

  const shouldReject =
    job.autoReject &&
    job.aiThreshold != null &&
    aiScoring.rating < job.aiThreshold;

  await applicationRepo.updateOne({
    filter: { _id: application._id, job: job._id },
    update: {
      aiRating: aiScoring.rating,
      aiNotes: aiScoring.reasoning,
      ...(shouldReject && {
        status: APPLICATION_STATUS.REJECTED,
        autoRejected: true,
      }),
    },
  });

  if (shouldReject) {
    activityLogger.info({
      event: "application.ai_auto_rejected",
      action: LOG_ACTION.AI_AUTO_REJECT_APPLICATION,
      targetType: LOG_TARGET_TYPE.APPLICATION,
      targetId: application._id,
      applicant: application.applicant,
      aiRating: aiScoring.rating,
      aiThreshold: job.aiThreshold,
    });

    notificationEmitter.emit(NOTIFICATION_EVENTS.APPLICATION_STATUS_UPDATE, {
      userId: application.applicant,
      status: APPLICATION_STATUS.REJECTED,
    });
  }
};
