import { RequestCookies } from "@edge-runtime/cookies";
import { next, rewrite } from "@vercel/edge";

import { decodeToken } from "./src/tokens";

export const config = {
  matcher: ["/api/users/:userId/(.*)"],
};

/**
 * Middleware for authenticate user.
 *
 * Uses a JWT token in cookie or Authorization header
 */
export default async function middleware(req: Request) {
  const cookies = new RequestCookies(req.headers);
  const token =
    cookies.get("accessToken")?.value ??
    req.headers.get("authorization")?.split(" ")[1];

  if (token) {
    try {
      await decodeToken(token);

      return next();
    } catch (err) {
      console.log(err);
    }
  }

  return rewrite("/api/errors/unauthorized");
}
