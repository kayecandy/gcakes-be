import { StatusCodes } from "http-status-codes";

import { VercelRequest, VercelResponse } from "@vercel/node";

export function unauthorisedHandler(req: VercelRequest, res: VercelResponse) {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    message: "Unauthorized!",
  });
}
