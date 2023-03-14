import { StatusCodes } from 'http-status-codes';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../src/contentful';
import { unauthorisedHandler } from '../../src/errors/unauthorized';
import {
  MultiHandler,
  withMultiHandlers,
} from '../../src/handlers';
import { corsMiddleware } from '../../src/middlewares/cors-middleware';
import { passwordCompare } from '../../src/password';
import { generateToken } from '../../src/tokens';

const loginHandler: MultiHandler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    res.status(StatusCodes.NOT_FOUND).end("Method not allowed");
    return {
      action: "send",
      response: res
    }
  }

  if(req.method === "OPTIONS"){
    res.status(StatusCodes.NO_CONTENT).end();
    return {
      action: "send",
      response: res
    }
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

  console.log("User", user);

  if (user) {
    const passwordCorrect = passwordCompare(req.body.password, user.password);

    if (passwordCorrect) {
      user.password = undefined;

      const accessToken = await generateToken(user);

      res
        .setHeader("Set-Cookie", [`accessToken=${accessToken}`])
        .status(StatusCodes.OK)
        .json({message:"Login successful!"});

      return {
        action: "send",
        response: res
      }
    }
  }

  unauthorisedHandler(req, res);
  return {
    action: "send",
    response: res
  }
}

export default withMultiHandlers([
  corsMiddleware,
  loginHandler
])