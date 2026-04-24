// import { Request,  Response} from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { AuthService } from "../../domain/auth.service";
// import { ResultStatus } from "../../../common/result/resultCode";

// export async function registrationEmailResendingHandler(req: Request<{}, {}, {email: string}>, res: Response){
// try{

//  const email = req.body.email;

//  const resendingEmailCode = await AuthService.confirmReplayEmailCode(email);
//  if(resendingEmailCode.status === ResultStatus.BadRequest) return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: resendingEmailCode.extensions});
//  if(resendingEmailCode.status === ResultStatus.Success) return  res.sendStatus(HttpStatus.NO_CONTENT);
 
// }catch(e: unknown){
// res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
// }
// }   