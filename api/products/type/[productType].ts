import { StatusCodes } from 'http-status-codes';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../../src/contentful';

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
                productType: req.query.productType,
              },
            })
          )
        ).json()
        console.log(t.data.productCollection.items)
        return res.status(StatusCodes.OK).json(t.data.productCollection.items);
  }
  