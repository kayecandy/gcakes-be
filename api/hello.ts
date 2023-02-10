import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

export default async function handler(re: VercelRequest, res: VercelResponse) {
  return res.json({
    success: true,
  });
}
