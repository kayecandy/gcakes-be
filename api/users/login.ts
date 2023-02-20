import { StatusCodes } from "http-status-codes";

import { VercelRequest, VercelResponse } from "@vercel/node";

import { fetchGQL } from "../../src/contentful";
import { passwordCompare } from "../../src/password";
import { generateToken } from "../../src/tokens";
import unauthorisedHandler from "../errors/unauthorized";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(StatusCodes.NOT_FOUND).end("Method not allowed");
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
                    password,
                    email
                }
            }
        }
      `,
      variables: {
        userId: req.body.userId,
      },
    })
  );

  const user = (await t.json()).data.userCollection.items[0];

  const passwordCorrect = passwordCompare(req.body.password, user.password);

  if (passwordCorrect) {
    user.password = undefined;

    const accessToken = await generateToken(user);

    return res
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Set-Cookie", [`accessToken=${accessToken}`])
      .status(StatusCodes.OK)
      .end("Login successful!");
  }

  return unauthorisedHandler(req, res);
}
