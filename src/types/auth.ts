import { User } from './user';

export type AuthUser = Pick<User, "sys"|"userid"|"email">

export type AccessToken = AuthUser & {
  iat: number;
  exp: number;
}