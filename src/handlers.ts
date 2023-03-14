import {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

export type MultiHandlerResponse = {
  action: "next" | "send";
  response: VercelResponse;
  data?: Record<string, unknown>;
} | VercelResponse;

export type MultiHandler = (
  req: VercelRequest,
  res: VercelResponse,
  data?: Record<string, unknown>
) => Promise<MultiHandlerResponse>;

export const withMultiHandlers = (handlers: MultiHandler[]) => {


  const mainHandler = async (req: VercelRequest, res: VercelResponse) => {
    const data = {};

    for (const handler of handlers) {
      const handlerRes = await handler(req, res, data);
      if("action" in handlerRes && handlerRes.action === "send"){
        return handlerRes.response;
      }else if(!("action" in handlerRes)){
        return handlerRes;
      }

      if("data" in handlerRes){
        Object.assign(data, handlerRes.data);
      }
    }

    return res;
  };

  return mainHandler;
};
