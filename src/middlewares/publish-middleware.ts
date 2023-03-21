import { StatusCodes } from 'http-status-codes';

import { fetchCM } from '../contentful';
import { MultiHandler } from '../handlers';

export type PublishMiddlewareData = {
  entryId?: string;
  version?: string;
};


/**
 * Publishes a Contentful CMS entry.
 * 
 * Needs AuthMiddleware to handle errors
 */
export const publishMiddleware: MultiHandler = async (
  req,
  res,
  data: PublishMiddlewareData = {}
) => {
  const { entryId, version = "1" } = data;

  try {

    const publishRes = await fetchCM(`entries/${entryId}/published`, {
      method: "PUT",
      headers: {
        "X-Contentful-Version": version
      }
    });

    if(!publishRes.ok){
      throw publishRes;
    }

    return res.status(StatusCodes.OK).json(
      await publishRes.json()
    )

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

};
