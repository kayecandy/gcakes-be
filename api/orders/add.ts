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
                        "en-US": req.body.customer,
                    },
                    products: {
                        "en-US": req.body.products,
                    },
                    quantity: {
                        "en-US": req.body.quantity,
                    },
                    deliveryAddress: {
                        "en-US": req.body.deliveryAddress,
                    },
                    paymentMethod: {
                        "en-US": req.body.paymentMethod,
                    },
                },
            }),
        })
    ).json();

    if (req.body.published) {
        await fetchCM(`entries/${order.sys.id}/published`, {
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