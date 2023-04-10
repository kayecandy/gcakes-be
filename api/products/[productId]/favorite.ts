import { StatusCodes } from 'http-status-codes';

import {
  fetchCM,
  fetchGQL,
} from '../../../src/contentful';
import {
  MultiHandler,
  withMultiHandlers,
} from '../../../src/handlers';
import {
  authMiddleware,
  AuthMiddlewareData,
} from '../../../src/middlewares/auth-middleware';
import { corsMiddleware } from '../../../src/middlewares/cors-middleware';
import { errorMiddleware } from '../../../src/middlewares/error-middleware';
import { methodMiddleware } from '../../../src/middlewares/method-middleware';
import { publishMiddleware } from '../../../src/middlewares/publish-middleware';

export const getFavoriteEntry = async (userId: string, productId: string) => {
  const t = await fetchGQL(
    JSON.stringify({
        query: `
          query($userId: String, $productId: String){
            favoritesCollection(where: {user: {sys: {id: $userId}}, product:{sys: {id: $productId}}}){
                items{
                    sys{
                        id
                    },
                    user{
                        sys{
                            id
                        }
                    },
                    product{
                        sys{
                            id
                        }
                    }
                }
        
            }
          }
        `,
        variables: {
            productId,
            userId
        },
    })
  );

  return (await t.json()).data.favoritesCollection.items;


}

export const favoriteHandler: MultiHandler =async (req, res, data: AuthMiddlewareData = {}) => {

  const { decodedToken } = data;

  try{

    if(!decodedToken){
      throw new Error("No token passed in review handler")
    }

    /**
     * Check for duplicates
     */
    const duplicateItems = await getFavoriteEntry(decodedToken.sys.id, req.query.productId as string);

    const hasDuplicate = duplicateItems.length > 0;

    if(hasDuplicate){
      const entryId = duplicateItems[0].sys.id;

      /**
       * Unpublish entry
       */
      await fetchCM(`entries/${entryId}/published`, {
        method: "DELETE"
      });

      /**
       * Delete entry
       */
      await fetchCM(`entries/${entryId}`, {
        method: "DELETE"
      });

      return res.status(StatusCodes.OK).json({
        message: "Favorite entry removed"
      })
    }


    const addFavorite = await fetchCM("entries", {
      method: "POST",
      headers: {
        "X-Contentful-Content-Type": "favorites",
      },
      body: JSON.stringify({
        fields: {
          product: {
            "en-US": {
              sys: {
                linkType: "Entry",
                id: req.query.productId,
              },
            },
          },
          user: {
            "en-US": {
              sys: {
                linkType: "Entry",
                id: decodedToken.sys.id,
              },
            },
          },
        },
      }),
    });

    if(!addFavorite.ok){
      throw addFavorite;
    }

    const addFavoriteJson = await addFavorite.json();

    return {
      action: "next",
      response: res,
      data: {
        ...data,
        entryId: addFavoriteJson.sys.id
      }
    }

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
  methodMiddleware(["POST"]),
  authMiddleware,
  favoriteHandler,
  publishMiddleware,
  errorMiddleware
])