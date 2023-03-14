import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { unauthorisedHandler } from '../errors/unauthorized';
import { MultiHandler } from '../handlers';
import { decodeToken } from '../tokens';

/**
 * Middleware for authenticate user.
 *
 * Uses a JWT token in cookie or Authorization header
 */
export const authMiddleware: MultiHandler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  const token =
    req.cookies.accessToken ?? req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decodedToken = await decodeToken(token);

      if (decodedToken.payload.userid === req.query.userId) {
        return {
          action: "next",
          response: res,
          data: {
            decodedToken: decodedToken.payload
          }
        };
      } else {
        throw new Error("Token `userid` doesn't match with parameter `userId`");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return {
    action: "send",
    response: unauthorisedHandler(req, res),
  };
};
