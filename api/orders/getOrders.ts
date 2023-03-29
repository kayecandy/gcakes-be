import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes } from "http-status-codes";
import { fetchGQL } from "../../src/contentful";

export default async function getOrdersHandler(req: VercelRequest, res: VercelResponse) {
    const orders = await fetchGQL(
        JSON.stringify({
            query: `
                query {
                    orderCollection {
                        items {
                            sys {
                                id
                            }
                            date
                            customer {
                                userid
                                email
                                address
                            }
                            productsCollection {
                                items {
                                    sys {
                                        id
                                    }
                                    name
                                    price
                                    productType
                                }
                            }
                            quantity
                            deliveryAddress
                        }
                    }
                }
            `,
        })
    );

    const response = await orders.json();

    return res
    .setHeader("Access-Control-Allow-Origin", "*")
    .status(StatusCodes.OK)
    .json(response.data.orderCollection.items);
}