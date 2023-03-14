import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

export type MultiHandlerResponse = {
  action: "next" | "send";
  response: VercelResponse;
} | VercelResponse;

export type MultiHandler = (
  req: VercelRequest,
  res: VercelResponse
) => Promise<MultiHandlerResponse>;

export const withMultiHandlers = (handlers: MultiHandler[]) => {
  const mainHandler = async (req: VercelRequest, res: VercelResponse) => {
    for (const handler of handlers) {
      const handlerRes = await handler(req, res);
      if("action" in handlerRes && handlerRes.action === "send"){
        return handlerRes.response;
      }else if(!("action" in handlerRes)){
        return handlerRes;
      }
    }

    return res;
  };

  return mainHandler;
};
