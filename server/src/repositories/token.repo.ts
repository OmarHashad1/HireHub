import { activeTokenModel } from "../models/activeToken.model.js";
import { IActiveToken } from "../types/activeToken.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class TokenRepo extends DatabaseRepo<IActiveToken> {
  constructor() {
    super(activeTokenModel);
  }
}

