import { StatusCodes } from 'http-status-codes';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { MultiHandler } from '../handlers';

export const methodMiddleware = (allowedMethods: string[])=>{
  const middleware:MultiHandler = async (
    req: VercelRequest,
    response: VercelResponse
  ) => {
    const methods = [...allowedMethods, "OPTIONS"];
    if (req.method && methods.indexOf(req.method) === -1) {
      return response
        .status(StatusCodes.NOT_FOUND)
        .setHeader("Allow", methods.join(","))
        .end("Method not allowed");

    }
    if(req.method === "OPTIONS"){
      if(req.method === "OPTIONS"){
        return response.status(StatusCodes.NO_CONTENT).end();
      }
    }
  
    return {
      action: "next",
      response
    }
  }

  return middleware;
}