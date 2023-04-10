import { StatusCodes } from 'http-status-codes';

import {
  MultiHandler,
  withMultiHandlers,
} from '../../src/handlers';
import {
  authMiddleware,
  AuthMiddlewareData,
} from '../../src/middlewares/auth-middleware';
import { corsMiddleware } from '../../src/middlewares/cors-middleware';
import { errorMiddleware } from '../../src/middlewares/error-middleware';
import { methodMiddleware } from '../../src/middlewares/method-middleware';
import { getFavoriteEntry } from './[productId]/favorite';

const getFavoritesHandler: MultiHandler = async (req, res, data: AuthMiddlewareData = {}) => {
  const { decodedToken } = data;

  try{
    if(!decodedToken){
      throw new Error("No token passed in review handler")
    }

    const favorites: Array<Record<string, any>> = await getFavoriteEntry(decodedToken.sys.id, undefined, true);


    return res.status(StatusCodes.OK).json(favorites.map(favorite=>{
      const {product, ...favoriteProps} = favorite;
      const {contentfulMetadata, ...props} = favorite.product;

      return {
        ...favoriteProps,
        product: {
          ...props,
          tags: contentfulMetadata.tags
        }
      }
    }))
    
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
  corsMiddleware,
  methodMiddleware(["GET"]),
  authMiddleware,
  getFavoritesHandler,
  errorMiddleware
])