import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import { fetchGQL } from '../../../src/contentful';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const t = await fetchGQL(
    JSON.stringify({
      query: `{
    productCollection{
      items{
        name
      }
    }
  }`,
    })
  );

  const response = await t.json();

  console.log(req.query.productType);

  return res.json(response);
}
