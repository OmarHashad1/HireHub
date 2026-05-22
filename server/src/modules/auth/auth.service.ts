import argon2 from "argon2";
import { ROLE } from "../../enums/user.enums.js";
import { UserRepo } from "../../repositories/user.repo.js";
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from "../../utils/errorHandler.util.js";
import { loginDTO, SignupDTO } from "../../schemas/auth.schema.js";
import { generateToken } from "../../utils/token.util.js";
import { nanoid } from "nanoid";
import { TokenRepo } from "../../repositories/token.repo.js";

const userRepo = new UserRepo();
const tokenRepo = new TokenRepo();
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

  const jti = nanoid(25);

  console.log(jti);
  const accessToken = generateToken({
    role: user.role,
    payload: {
      _id: user._id as unknown as string,
      email: user.email,
      role: user.role,
    },
    options: {
      jwtid: jti,
      expiresIn: "30M",
    },
  });

  const refreshToken = generateToken({
    role: user.role,
    type: "refresh",
    payload: {
      _id: user._id as unknown as string,
      email: user.email,
      role: user.role,
    },
    options: {
      jwtid: jti,
      expiresIn: "1W",
    },
  });
  await tokenRepo.create({
    data: {
      jti,
      userId: user._id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
  });

  return {
    accessToken,
    refreshToken,
    firstName: user.firstName,
  };
};
