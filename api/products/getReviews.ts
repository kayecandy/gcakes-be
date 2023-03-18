import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchGQL } from '../../src/contentful';
import { StatusCodes } from "http-status-codes";

// Currently Only For Testing
export default async function reviewsHandler(req: VercelRequest, res: VercelResponse) {
    const t = await fetchGQL(
        JSON.stringify({
            query: `
                query {
                    reviewsCollection {
                        items {
                            title
                            rating
                            comment
                            product {
                                name
                                price
                            }
                            user {
                                userid
                                email
                            }
                        }
                    }
                }
            `,
        })
    );

    const response = await t.json();

    return res
    .setHeader("Access-Control-Allow-Origin", "*")
    .status(StatusCodes.OK)
    .json(response.data.reviewsCollection.items);
}
