import { JWTPayload, jwtVerify, SignJWT } from "jose";

export const TokenConfig = {
  secret: process.env.TOKEN_SECRET ?? "",
  token_expiration: "1d",
};

export const generateToken = (user: JWTPayload) => {
  return new SignJWT(user)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(TokenConfig.token_expiration)
    .sign(new TextEncoder().encode(TokenConfig.secret));
};

export const decodeToken = (token: string) => {
  return jwtVerify(token, new TextEncoder().encode(TokenConfig.secret));
};
