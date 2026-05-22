import argon2 from "argon2";
import { ROLE } from "../../enums/user.enums.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { ConflictException } from "../../utils/errorHandler.util.js";
import { SignupDTO } from "../../schemas/auth.schema.js";

const userRepo = new UserRepo();

export const signup = async (dto: SignupDTO) => {
  const existing = await userRepo.findOne({
    filter: { email: dto.email },
    projection: { _id: 1 },
    options: { lean: true },
  });

  if (existing) throw new ConflictException("Email is already in use");

  const hashedPassword = await argon2.hash(dto.password);

  const user = await userRepo.create({
    data: { ...dto, password: hashedPassword, role: ROLE.USER },
  });

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
};
