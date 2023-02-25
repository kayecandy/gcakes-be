import { StatusCodes } from "http-status-codes";

import { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchGQL } from "../../../src/contentful";
import { MultiHandler, withMultiHandlers } from "../../../src/handlers";
import { authMiddleware } from "../../../src/middlewares/auth-middleware";

export const userDetailsHandler: MultiHandler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  if (req.method !== "POST") {
    return {
      action: "send",
      response: res.status(StatusCodes.NOT_FOUND).end("Method not allowed"),
    };
  }

  const t = await fetchGQL(
    JSON.stringify({
      query: `
        query($userId: String){
            userCollection(where: {userid: $userId}){
                items{
                    sys{
                      id
                    },
                    userid,
                    email,
                    firstName,
                    lastName,
                    address
                }
            }
        }
      `,
      variables: {
        userId: req.query.userId,
      },
    })
  );

  const user = (await t.json()).data.userCollection.items[0];

  return {
    response: res.status(StatusCodes.OK).json(user),
    action: "send",
  };
};

export default withMultiHandlers([authMiddleware, userDetailsHandler]);
