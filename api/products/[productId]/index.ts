import { StatusCodes } from 'http-status-codes';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../../src/contentful';
// Gets a Product using a productId (sys.id)
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    
        return res.status(StatusCodes.OK).json(t.data.productCollection.items);
  }
  