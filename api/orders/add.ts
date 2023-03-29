import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes } from "http-status-codes";
import { fetchCM } from "../../src/contentful";
import { withMultiHandlers } from "../../src/handlers";
import { methodMiddleware } from "../../src/middlewares/method-middleware";

async function addOrderHandler(req: VercelRequest, res: VercelResponse) {

    const order = await (
        await fetchCM("entries", {
            method: "POST",
            headers: {
                "X-Contentful-Content-Type": "order",
            },
            body: JSON.stringify({
                fields: {
                    status: {
                        "en-US": req.body.status,
                    },
                    date: {
                        "en-US": req.body.date,
                    },
                    customer: {
                        "en-US": {
                            sys: {
                                linkType: "Entry",
                                id: req.body.userId,
                            },
                        },
                    },
                    product: {
                        "en-US": {
                            sys: {
                                linkType: "Entry",
                                id: req.body.productId
                            },
                        },
                    },
                    // productsCollection: {
                    //     "en-US": {
                    //         type: "Array",
                    //         items: {
                    //             sys: {
                    //                 id: req.body.productIds,
                    //                 linkType: "Entry",
                    //             },
                    //         },
                    //     },
                    // },
                    quantity: {
                        "en-US": req.body.quantity,
                    },
                    deliveryAddress: {
                        "en-US": req.body.deliveryAddress,
                    },
                    // paymentMethod: {
                    //     "en-US": req.body.paymentMethod,
                    // },
                },
            }),
        })
    );

    if (!order.ok) {
        throw order;
    }
    
    const orderJson = await order.json();

    if (req.body.published) {
        await fetchCM(`entries/${orderJson.sys.id}/published`, {
            method: "PUT",
            headers: {
                "X-Contentful-Version": "1",
            }
        });
    }

    console.log("Order request ", req.body);

    return res.status(StatusCodes.OK).json(order)
}

export default withMultiHandlers([
    methodMiddleware(["POST"]),
    addOrderHandler
])