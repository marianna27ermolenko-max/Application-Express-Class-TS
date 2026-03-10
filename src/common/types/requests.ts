import { Request } from "express"; 
import { IdType } from "./id"; 

export type RequestWithBody<B> = Request<{}, {}, B>;
export type RequestWithQuery<B> = Request<{}, {}, {}, B>;
export type RequestWithParams<P> = Request<P>;
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>;