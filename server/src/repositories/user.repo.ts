import { userModel } from "../models/users.model.js";
import { IUser } from "../types/user.types.js";
import { DatabaseRepo } from "./db.repo.js";

export class UserRepo extends DatabaseRepo<IUser> {
  constructor() {
    super(userModel);
  }
}
