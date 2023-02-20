import { StatusCodes } from "http-status-codes";

import { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchGQL } from "../../../src/contentful";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const t = await fetchGQL(
    JSON.stringify({
      query: `
        query ($productType: String) {
          productCollection(where: { featured: true, productType: $productType }) {
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
              featured
              productType
            }
          }
        }
      `,
      variables: {
        productType: "cakes",
      },
    })
  );

  const response = await t.json();

  return res.status(StatusCodes.OK).json(response.data.productCollection.items);
}
