import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../common/types/http.status";
import { jwtService } from "../adapters/jwt.service";
import { usersRepository } from "../../users/infrastructure/user.repository";
import { authServer } from "../domain/auth.service";
import { ResultStatus } from "../../common/result/resultCode";

export const jwtRefreshTokenGuardMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {                                    
    
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) return res.sendStatus(HttpStatus.UNAUTHORIZED);

  const check = await authServer.checkRefreshTokenBlackList(refreshToken);
  if(check.status === ResultStatus.Forbidden){
    return res.status(HttpStatus.UNAUTHORIZED).json({ errorMessages: check.extensions })}

  const userId = await jwtService.getUserIdByToken(refreshToken);
  if (!userId) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  const user = await usersRepository.findById(userId);
  if (!user) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  req.userId = user._id.toString();

  next();
};
