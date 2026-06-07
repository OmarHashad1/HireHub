import { LOGOUT_TYPE } from "../../enums/user.enums.js";
import { IUser } from "../../types/user.types.js";
import { decodeToken } from "../../utils/token.util.js";
import { redisService } from "../../DB/RedisService.js";
import { UserRepo } from "../../repositories/user.repo.js";
import { uploadAsset } from "../../utils/s3.util.js";
import { multerStorageType } from "../../enums/multer.enums.js";

const userRepo = new UserRepo();

export const logout = async ({
  type,
  user,
  accessToken,
}: {
  type: LOGOUT_TYPE;
  user: IUser;
  accessToken: string;
}) => {
  switch (type) {
    case LOGOUT_TYPE.DEVICE: {
      const { jti, iat } = await decodeToken({
        token: accessToken,
        type: "access",
      });
      await redisService.set({
        key: redisService.revokedTokenKey({
          jti,
          userId: user._id as unknown as string,
        }),
        value: jti,
        ttl: iat + 7 * 24 * 60 * 60 - Math.floor(Date.now() / 1000),
      });
      break;
    }
    case LOGOUT_TYPE.ALL: {
      await userRepo.updateOne({
        filter: {
          _id: user._id,
        },
        update: {
          credentialsChangedAt: new Date(),
        },
      });
      break;
    }
    default: {
      throw new Error("Invalid Logout Type");
    }
  }
};

export const changeAvatarService = async ({
  user,
  file,
}: {
  user: IUser;
  file: Express.Multer.File;
}) => {
  const bucketKey = await uploadAsset({
    path: `users/${user._id}`,
    file,
    storageStrategy: multerStorageType.DESK,
  });
  await userRepo.updateOne({
    filter: {
      _id: user._id,
    },
    update: {
      avatar: bucketKey,
    },
  });
};
