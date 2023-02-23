import { StatusCodes } from "http-status-codes";

import { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchCM } from "../src/contentful";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res
      .status(StatusCodes.NOT_FOUND)
      .setHeader("Allow", "POST")
      .end("Not allowed");
  }

  console.log("This is body", req.body);

  const product = await (
    await fetchCM("entries", {
      method: "POST",
      headers: {
        "X-Contentful-Content-Type": "product",
      },
      body: JSON.stringify({
        fields: {
          name: {
            "en-US": req.body.name,
          },
          price: {
            "en-US": req.body.price,
          },
          productType: {
            "en-US": req.body.productType,
          },
        },
      }),
    })
  ).json();

  if (req.body.published) {
    await fetchCM(`entries/${product.sys.id}/published`, {
      method: "PUT",
      headers: {
        "X-Contentful-Version": "1",
      },
    });
  }

  return res.status(StatusCodes.OK).json(product);
}
