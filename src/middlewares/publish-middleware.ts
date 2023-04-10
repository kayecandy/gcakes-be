import { StatusCodes } from 'http-status-codes';
import { Response } from 'node-fetch';

import { fetchCM } from '../contentful';
import { MultiHandler } from '../handlers';
import { ErrorMiddlewareData } from './error-middleware';

export type PublishMiddlewareData = {
  entryId?: string;
  version?: string;
  publishResFormatter?: (publishRes: Response) => Promise<any>;
};

/**
 * Publishes a Contentful CMS entry.
 *
 * Needs AuthMiddleware to handle errors
 */
export const publishMiddleware: MultiHandler = async (
  req,
  res,
  data: PublishMiddlewareData & ErrorMiddlewareData = {}
) => {
  const { entryId, version = "1", publishResFormatter } = data;

  try {
    if(data.error){
      throw data.error;
    }

    const publishRes = await fetchCM(`entries/${entryId}/published`, {
      method: "PUT",
      headers: {
        "X-Contentful-Version": version,
      },
    });

    if (!publishRes.ok) {
      throw publishRes;
    }

    return res
      .status(StatusCodes.OK)
      .json(
        publishResFormatter
          ? await publishResFormatter(publishRes)
          : await publishRes.json()
      );
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
