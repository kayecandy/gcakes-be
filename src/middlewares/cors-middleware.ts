import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { MultiHandler } from '../handlers';

export const corsMiddleware: MultiHandler = async (
  req: VercelRequest,
  response: VercelResponse
) => {
  response.setHeader(
    "Access-Control-Allow-Origin",
    req.headers.origin ?? "*"
  )

  return {
    action: "next",
    response
  }
}