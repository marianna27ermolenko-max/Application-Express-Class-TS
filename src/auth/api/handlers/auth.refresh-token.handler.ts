// import { Request, Response } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { authService, AuthService } from "../../domain/auth.service";
// import { ResultStatus } from "../../../common/result/resultCode";

// export async function createRefreshTokenHandler(req: Request, res: Response){

//   try {
 
//     const  userId = req.userId;
//     const  refreshToken = req.cookies.refreshToken; 

//     const updatingTokens = await authService.updatingAccessAndRefreshTokens(userId!, refreshToken);

//     if(updatingTokens.status === ResultStatus.Success && updatingTokens.data){
//         const [ newAccessToken, newRefreshToken ] = updatingTokens.data;
//          res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true })
//          .status(HttpStatus.OK)
//          .json({ accessToken: newAccessToken });
//     }

//     } catch (err: unknown) {
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//   }

// }