import { StatusCodes } from 'http-status-codes';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../../src/contentful';
import {
  MultiHandler,
  withMultiHandlers,
} from '../../../src/handlers';
import {
  authMiddleware,
  AuthMiddlewareData,
} from '../../../src/middlewares/auth-middleware';
import { errorMiddleware } from '../../../src/middlewares/error-middleware';
import { getFavoriteEntry } from './favorite';

export type ViewProductData = {
  isFavorite?: boolean;
}

const isProductFavoriteHandler: MultiHandler = async (req, res, data: AuthMiddlewareData = {}) => {

  if(!data.decodedToken){
    return {
      action: "next",
      response: res,
      data
    }
  }

  try{
    const favoriteEntry: [] = await getFavoriteEntry(data.decodedToken.sys.id, req.query.productId as string)

    if(favoriteEntry.length > 0){
      return {
        action: "next",
        response: res,
        data: {
          ...data,
          isFavorite: true
        }
      }
    }

    return {
      action: "next",
      response: res,
      data
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

// Gets a Product using a productId (sys.id)
async function viewProductHandler(req: VercelRequest, res: VercelResponse, data: ViewProductData = {}) {
        const t = await (
          await fetchGQL(
            JSON.stringify({
              query: `
                query ($productId: String) {
                  productCollection(where: { sys: { id: $productId } }) {
                    items {
                      sys {
                        id
                      }
                      name
                      price
                      description
                      image {
                        url
                      }
                      productType
                    contentfulMetadata{
                        tags{
                            id,
                            name
                        }
                      }
                    }
                  }
                }
              `,
              variables: {
                productId: req.query.productId,
              },
            })
          )
        ).json()
        const s = t.data.productCollection.items.map((item: any) => {
          const { contentfulMetadata, ...itemProperies } = item
          return {
            ...itemProperies,
            tags: contentfulMetadata.tags,
            ...('isFavorite' in data) ? {
              isFavorite: data.isFavorite
            } : {}
          }})
        return res.status(StatusCodes.OK).json(s);
  }

export default async function(req: VercelRequest, res: VercelResponse){
  if(req.headers.authorization || req.cookies.accessToken){
    return await withMultiHandlers([
      authMiddleware,
      isProductFavoriteHandler,
      viewProductHandler,
      errorMiddleware
    ])(req, res);

  }else{
    return await viewProductHandler(req, res);
  }
}
  