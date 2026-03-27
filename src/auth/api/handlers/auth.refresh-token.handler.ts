import { Request, Response } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { authServer } from "../../domain/auth.service";
import { ResultStatus } from "../../../common/result/resultCode";

export async function createRefreshTokenHandler(req: Request, res: Response){

  try {
 
    const  userId = req.userId;
    const  refreshToken = req.cookies.refreshToken;

    const insertIntoRefreshTokenBlackList = await authServer.insertIntoBlackListRefreshToken(refreshToken); //закинули в черный список - надо что - то проверять? закинулся ли он?
    const updatingTokens = await authServer.updatingAccsesAndRefrefhTokens(userId!);

    if(updatingTokens.status === ResultStatus.Success && updatingTokens.data){
        const [ accessToken, refreshToken ] = updatingTokens.data;
         res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
         .status(HttpStatus.OK)
         .json({ accessToken });
    }

    } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }

}