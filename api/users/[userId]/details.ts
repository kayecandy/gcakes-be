import { StatusCodes } from 'http-status-codes';
import { JWTPayload } from 'jose';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../../src/contentful';
import {
  MultiHandler,
  withMultiHandlers,
} from '../../../src/handlers';
import { authMiddleware } from '../../../src/middlewares/auth-middleware';
import { corsMiddleware } from '../../../src/middlewares/cors-middleware';
import { methodMiddleware } from '../../../src/middlewares/method-middleware';

export const userDetailsHandler: MultiHandler = async (
  req: VercelRequest,
  res: VercelResponse,
  data = {}
) => {

  const {decodedToken} = data;

  if(!decodedToken){
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .end();
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
    response: res.status(StatusCodes.OK).json({
      user,
      expiration: (decodedToken as JWTPayload).exp
    }),
    action: "send",
  };
};

export default withMultiHandlers([
  corsMiddleware,
  methodMiddleware(["GET"]),
  authMiddleware,
  userDetailsHandler,
]);
