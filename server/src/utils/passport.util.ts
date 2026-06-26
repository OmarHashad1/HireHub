import { UserRepo } from "../repositories/user.repo.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import {
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../configs/env.config.js";

import { PROVIDER } from "../enums/user.enums.js";
import { IUser } from "../types/user.types.js";

const userRepo = new UserRepo();

export const configPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, cb) => {
        try {
          const userExist = await userRepo.findOne({
            filter: {
              email: profile.emails![0]!.value,
            },
            options: {
              lean: true,
            },
          });

          if (userExist?.provider == PROVIDER.SYSTEM) {
            return cb(null, false);
          }

          const user =
            userExist ??
            (await userRepo.create({
              data: {
                firstName: profile.name?.givenName,
                googleId: profile.id,
                lastName: profile.name?.familyName,
                email: profile.emails![0]!.value,
                avatar: profile.photos![0]!.value,
                provider: PROVIDER.GOOGLE,
                isEmailVerified:true,
              },
            }));
          cb(null, user as IUser);
        } catch (err) {
          cb(err);
        }
      },
    ),
  );
};
