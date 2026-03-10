import { NextFunction, Response, Request } from "express";
import { HttpStatus } from "../../common/types/http.status";


export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty';

export const superAdminGuardMiddleware = (
    req: Request , 
    res: Response, 
    next: NextFunction
) => {

const auth = req.headers['authorization'] as string;

if(!auth){
    res.sendStatus(HttpStatus.UNAUTHORIZED);
    return;
}

const [authType, token] = auth.split(' ');

if(authType !== 'Basic'){
    res.sendStatus(HttpStatus.UNAUTHORIZED);
    return;
}

const credentials = Buffer.from(token, 'base64').toString('utf-8');
const [username, password] = credentials.split(':');

if(username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD){
    res.sendStatus(HttpStatus.UNAUTHORIZED);
    return;
}

next();

}

