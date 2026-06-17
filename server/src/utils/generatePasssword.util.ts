import { nanoid } from "nanoid";
export const generatePassword = () => {
  const password = nanoid(10);
  return password;
};
