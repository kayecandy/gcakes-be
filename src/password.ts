import { compareSync, hashSync } from "bcrypt";

export const PasswordConfig = {
  saltRounds: 3,
};

export const passwordHash = (password: string) => {
  return hashSync(password, PasswordConfig.saltRounds);
};

export const passwordCompare = (password: string, passwordHash: string) => {
  return compareSync(password, passwordHash);
};
