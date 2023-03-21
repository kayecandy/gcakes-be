import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { unauthorisedHandler } from '../errors/unauthorized';
import { MultiHandler } from '../handlers';
import { decodeToken } from '../tokens';
import { User } from '../types/user';

export type AuthMiddlewareData = {
  decodedToken?: User;
}

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

      if (req.query.userId && decodedToken.payload.userid !== req.query.userId) {
        throw new Error("Token `userid` doesn't match with parameter `userId`");
        
      } else {
        return {
          action: "next",
          response: res,
          data: {
            decodedToken: decodedToken.payload
          }
        };
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
