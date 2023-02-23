import { StatusCodes } from "http-status-codes";

import { VercelRequest, VercelResponse } from "@vercel/node";

export default function unauthorisedHandler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.status(StatusCodes.UNAUTHORIZED).json({
    message: "Unauthorized!",
  });
}
