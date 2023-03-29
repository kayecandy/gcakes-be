import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchGQL } from '../../../src/contentful';
import { StatusCodes } from "http-status-codes";

// Gets reviews of a product using a productId associated
export default async function reviewsHandler(req: VercelRequest, res: VercelResponse) {
    const t = await fetchGQL(
        JSON.stringify({
            query: `
                query ($productId: String) {
                    reviewsCollection(where: { product: { sys: { id: $productId }}}) {
                        items {
                            sys {
                                id
                            }
                            title
                            rating
                            comment
                            product {
                                name
                                price
                                description
                                image {
                                    description
                                    size
                                    height
                                    width
                                }
                                featured
                            }
                            user {
                                userid
                                firstName
                                lastName
                                birthday
                                email
                                address
                                admin
                            }
                        }
                    }
                }
            `,
            variables: {
                productId: req.query.productId,
            },
        })
    );

    const response = await t.json();

    return res
    .setHeader("Access-Control-Allow-Origin", "*")
    .status(StatusCodes.OK)
    .json(response.data.reviewsCollection.items);
}
