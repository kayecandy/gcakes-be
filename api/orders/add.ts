import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes } from "http-status-codes";
import { fetchCM } from "../../src/contentful";
import { MultiHandler, withMultiHandlers } from "../../src/handlers";
import { AuthMiddlewareData } from "../../src/middlewares/auth-middleware";
import { errorMiddleware } from "../../src/middlewares/error-middleware";
import { methodMiddleware } from "../../src/middlewares/method-middleware";
import { publishMiddleware } from "../../src/middlewares/publish-middleware";

const addOrderHandler: MultiHandler = async(
    req, 
    res,
    data: AuthMiddlewareData = {}
    ) => {
    try {
        console.log('test ',req.body.productId);
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
                        products: {
                            "en-US": req.body.productId.map((id : string) => ({
                                    sys: {
                                        id,
                                        linkType: "Entry"
                                    }
                                })
                            ),
                        },
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

        console.log("Order request ", req.body);

        return {
            action: "next",
            response: res,
            data: {
            ...data,
            entryId: orderJson.sys.id
            }
        };
    } catch (e) {
        return {
          action: "next",
          response: res,
          data: {
            ...data,
            error: e,
          },
        };
      }

}

export default withMultiHandlers([
    methodMiddleware(["POST"]),
    addOrderHandler,
    publishMiddleware,
    errorMiddleware
])