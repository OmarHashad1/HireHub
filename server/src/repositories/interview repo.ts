import { interviewModel } from "../models/interview.model.js";
import { IInterview } from "../types/inteview.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class InterviewRepo extends DatabaseRepo<IInterview> {
  constructor() {
    super(interviewModel);
  }
}
