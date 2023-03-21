import { StatusCodes } from 'http-status-codes';
import { Response } from 'node-fetch';

import { MultiHandler } from '../handlers';

export type ErrorMiddlewareData = {
  error?: Error | Response;
}

export const errorMiddleware: MultiHandler = async (req, res, {error}: ErrorMiddlewareData = {})=>{


  if(error){


    if(error instanceof Error){
      console.log("Error middleware (Error)", error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: (error as Error).message
      })
    }else if(error instanceof Response){
      const errorJson = await error.json();
      console.log("Error middleware (Response)", errorJson)

      return res.status(error.status).json(errorJson)
    }
  

    console.log("Error middleware (Object)", error)
  
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Oops! Something went wrong with your request",
      error
    })
  }

  return {
    action: "next",
    response: res
  }
}