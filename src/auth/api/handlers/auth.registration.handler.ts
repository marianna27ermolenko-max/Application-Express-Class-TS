import { Response } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { RequestWithBody } from "../../../common/types/requests";
import { CreateUserDto } from "../../../users/types/create.user.dto";
import { authServer } from "../../domain/auth.service";
import { ResultStatus } from "../../../common/result/resultCode";

export async function userRegistrationHandler(req: RequestWithBody<CreateUserDto>, res: Response){

try{

const { login, password, email } = req.body; 

const result = await authServer.registrationUser({login, password, email});

if(result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: result.extensions});
if(result.status === ResultStatus.Success) return res.sendStatus(HttpStatus.NO_CONTENT);

}catch(e: unknown){
     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}
}