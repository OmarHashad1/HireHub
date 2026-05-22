import { CookieOptions } from "express";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 30 * 60 * 1000,
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
