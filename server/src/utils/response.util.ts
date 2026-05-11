import { successResponseDTO, errorResponseDTO } from "../types/global.types.js";

export const successRes = <T>({
  res,
  message,
  status,
  data,
}: successResponseDTO<T>) => {
  const body =
    data !== undefined
      ? { statusCode: status, message, data }
      : { statusCode: status, message };
  res.status(status).json(body);
};

export const errorRes = ({ res, message, status }: errorResponseDTO) => {
  res.status(status).json({ statusCode: status, message });
};
