import { StatusCodes } from "http-status-codes";

import { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchGQL } from "../../../src/contentful";

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
  ).json();
  const s = t.data.productCollection.items.map((item: any) => {
    const { contentfulMetadata, ...itemProperies } = item;
    return {
      ...itemProperies,
      tags: contentfulMetadata.tags,
    };
  });
  return res.status(StatusCodes.OK).json(s);
}
