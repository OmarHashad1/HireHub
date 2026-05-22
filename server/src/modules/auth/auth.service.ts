import argon2 from "argon2";
import { ROLE, USER_STATUS } from "../../enums/user.enums.js";
import { UserRepo } from "../../repositories/user.repo.js";
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from "../../utils/errorHandler.util.js";
import { loginDTO, SignupDTO } from "../../schemas/auth.schema.js";
import { generateTokens, token_secrets } from "../../utils/token.util.js";

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

export const login = async (dto: loginDTO) => {
  const user = await userRepo.findOne({
    filter: { email: dto.email },
    projection: {
      _id: 1,
      role: 1,
      password: 1,
      email: 1,
      firstName: 1,
    },
    options: { lean: true },
  });
  if (
    !user ||
    !user.password ||
    !(await argon2.verify(user.password, dto.password))
  )
    throw new UnauthorizedException("Email or password is not correct");
  if (!user.role) {
    throw new InternalServerErrorException();
  }
  if (
    user.status == USER_STATUS.BANNED ||
    user.status == USER_STATUS.DEACTIVAED
  ) {
    throw new UnauthorizedException(
      "Your account has been suspended. Please contact support.",
    );
  }

  const { accessToken, refreshToken } = await generateTokens({
    id: user._id as unknown as string,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken,
    firstName: user.firstName,
  };
};

export const googleLogin = async (user: {
  _id:string ;
  email: string;
  role: string;
  firstName: string;
}) => {
  const { accessToken, refreshToken } = await generateTokens({
    id: user._id as unknown as  string,
    email: user.email,
    role: user.role as keyof typeof token_secrets,
  });

  return { accessToken, refreshToken, firstName: user.firstName };
};
