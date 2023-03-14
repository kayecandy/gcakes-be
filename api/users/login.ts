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
import { methodMiddleware } from '../../src/middlewares/method-middleware';
import { passwordCompare } from '../../src/password';
import {
  decodeToken,
  generateToken,
} from '../../src/tokens';

const loginHandler: MultiHandler = async (req: VercelRequest, res: VercelResponse) => {

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
      const decodedAccessToken = await decodeToken(accessToken);

      res
        .setHeader("Set-Cookie", [`accessToken=${accessToken}`])
        .status(StatusCodes.OK)
        .json({
          accessToken,
          user,
          exp: decodedAccessToken.payload.exp
        });

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
  methodMiddleware(["POST"]),
  corsMiddleware,
  loginHandler
])