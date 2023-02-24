import { StatusCodes } from 'http-status-codes';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../src/contentful';

export default async function handler(req: VercelRequest, res: VercelResponse) {
        const t = await (
          await fetchGQL(
            JSON.stringify({
              query: `
                query ($productType: String) {
                  productCollection(where: { productType: $productType }) {
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
                productType: req.query.productType,
              },
            })
          )
        ).json()
    
        return res.status(StatusCodes.OK).json(t.data.productCollection.items);
  }
  