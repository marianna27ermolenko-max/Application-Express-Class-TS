// import { Request,  Response} from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { authService } from "../../domain/auth.service";
// import { ResultStatus } from "../../../common/result/resultCode";

// export async function userRegistrationConfirmationHandler(req: Request<{},{},{code: string}>, res: Response){
// try{

// const code = req.body.code;
// const confirmCode =  await authService.confirmEmail(code);
// if(confirmCode.status === ResultStatus.BadRequest) return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: confirmCode.extensions});
// if(confirmCode.status === ResultStatus.Success) return res.sendStatus(HttpStatus.NO_CONTENT);

// }catch(e: unknown){
//      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
// }
// }