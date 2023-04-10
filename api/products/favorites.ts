import { StatusCodes } from 'http-status-codes';

import {
  MultiHandler,
  withMultiHandlers,
} from '../../src/handlers';
import {
  authMiddleware,
  AuthMiddlewareData,
} from '../../src/middlewares/auth-middleware';
import { errorMiddleware } from '../../src/middlewares/error-middleware';
import { getFavoriteEntry } from './[productId]/favorite';

const getFavoritesHandler: MultiHandler = async (req, res, data: AuthMiddlewareData = {}) => {
  const { decodedToken } = data;

  try{
    if(!decodedToken){
      throw new Error("No token passed in review handler")
    }

    const favorites = await getFavoriteEntry(decodedToken.sys.id, undefined, true);


    return res.status(StatusCodes.OK).json(favorites)
    
  }catch(e){
    return {
      action: "next",
      response: res,
      data: {
        ...data,
        error: e
      }
    }
  }
}

export default withMultiHandlers([
  authMiddleware,
  getFavoritesHandler,
  errorMiddleware
])