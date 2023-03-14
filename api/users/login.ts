import { StatusCodes } from 'http-status-codes';

import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../src/contentful';
import { unauthorisedHandler } from '../../src/errors/unauthorized';
import { passwordCompare } from '../../src/password';
import { generateToken } from '../../src/tokens';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return res.status(StatusCodes.NOT_FOUND).end("Method not allowed");
  }

  if(req.method === "OPTIONS"){
    return res.status(StatusCodes.NO_CONTENT).end();
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

      return res
        .setHeader("Set-Cookie", [`accessToken=${accessToken}`])
        .status(StatusCodes.OK)
        .end({message:"Login successful!"});
    }
  }

  return unauthorisedHandler(req, res);
}
