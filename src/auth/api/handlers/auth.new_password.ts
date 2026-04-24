// import { Request, Response } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { authService, AuthService } from "../../domain/auth.service";
// import { ResultStatus } from "../../../common/result/resultCode";

// export async function getNewPasswordHandler(req: Request<{}, {}, {newPassword: string, recoveryCode: string}>, res: Response){
//     try {

//     const { newPassword, recoveryCode } = req.body;
//     const result = await authService.newPassword(newPassword, recoveryCode);

//     if(result.status === ResultStatus.BadRequest){return res.status(HttpStatus.BAD_REQUEST).json({ "errorsMessages": result.extensions})}
//     if(result.status === ResultStatus.Success){return res.sendStatus(HttpStatus.NO_CONTENT);}

//     } catch (err: unknown) {
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }