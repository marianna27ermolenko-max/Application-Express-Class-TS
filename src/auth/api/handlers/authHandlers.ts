import { Request,  Response} from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { ResultStatus } from "../../../common/result/resultCode";
import { RequestWithBody } from "../../../common/types/requests";
import { LoginDto } from "../../types/login.dto";
import { CreateUserDto } from "../../../users/types/create.user.dto";
import { AuthService } from "../../domain/auth.service";
import { inject, injectable } from "inversify";

@injectable()
export class AuthController {

authService: AuthService;

constructor(@inject(AuthService) authService: AuthService){
   this.authService = authService;
}

async  userRegistrationHandler(req: RequestWithBody<CreateUserDto>, res: Response){
    
    try{
    
    const { login, password, email } = req.body;  
    const result = await this.authService.registrationUser({login, password, email});
    
    if(result.status === ResultStatus.BadRequest) return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: result.extensions});
    if(result.status === ResultStatus.Success) return res.sendStatus(HttpStatus.NO_CONTENT);
    
    }catch(e: unknown){
         res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    }

async registrationEmailResendingHandler(req: Request<{}, {}, {email: string}>, res: Response){
try{

 const email = req.body.email;

 const resendingEmailCode = await this.authService.confirmReplayEmailCode(email);
 if(resendingEmailCode.status === ResultStatus.BadRequest) return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: resendingEmailCode.extensions});
 if(resendingEmailCode.status === ResultStatus.Success) return  res.sendStatus(HttpStatus.NO_CONTENT);
 
}catch(e: unknown){
res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}
}  

async userRegistrationConfirmationHandler(req: Request<{},{},{code: string}>, res: Response){
try{

const code = req.body.code;
const confirmCode =  await this.authService.confirmEmail(code);
if(confirmCode.status === ResultStatus.BadRequest) return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: confirmCode.extensions});
if(confirmCode.status === ResultStatus.Success) return res.sendStatus(HttpStatus.NO_CONTENT);

}catch(e: unknown){
     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}
}

async recoveryPasswordHandler(req: Request<{}, {}, {email: string}>, res: Response){
    try {

    const email = req.body.email;
    await this.authService.recoveryPassword(email);

    return res.sendStatus(HttpStatus.NO_CONTENT);

    } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async createRefreshTokenHandler(req: Request, res: Response){

  try {
 
    const  userId = req.userId;
    const  refreshToken = req.cookies.refreshToken; 

    const updatingTokens = await this.authService.updatingAccessAndRefreshTokens(userId!, refreshToken);

    if(updatingTokens.status === ResultStatus.Success && updatingTokens.data){
        const [ newAccessToken, newRefreshToken ] = updatingTokens.data;
         res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true })
         .status(HttpStatus.OK)
         .json({ accessToken: newAccessToken });
    }

    } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }

}

async getNewPasswordHandler(req: Request<{}, {}, {newPassword: string, recoveryCode: string}>, res: Response){
    try {

    const { newPassword, recoveryCode } = req.body;
    const result = await this.authService.newPassword(newPassword, recoveryCode);

    if(result.status === ResultStatus.BadRequest){return res.status(HttpStatus.BAD_REQUEST).json({ errorsMessages: result.extensions})}
    if(result.status === ResultStatus.Success){return res.sendStatus(HttpStatus.NO_CONTENT);}

    } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}


async logoutHandler(req: Request, res: Response){

try {

    const refreshToken = req.cookies.refreshToken;
    const existSession = await this.authService.deleteSession(refreshToken); 
     
    if(existSession.status === ResultStatus.Success) 
        return res.sendStatus(HttpStatus.NO_CONTENT)

    return res.sendStatus(HttpStatus.UNAUTHORIZED);

    } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }

}

async getAuthUserHandler(req: Request, res: Response) {

  try {
    const userId = req.userId; 

    if (!userId) {
      return res.sendStatus(HttpStatus.UNAUTHORIZED);
    }

    const user = await this.authService.getUserByUserId(userId);
    if (!user) {
      return res.sendStatus(HttpStatus.UNAUTHORIZED);
    }
    
    return res.status(HttpStatus.OK).json(user);
    
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async createAuthUserHandler(
  req: RequestWithBody<LoginDto>,
  res: Response,
) {
  try { 

    const { loginOrEmail, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip; 
    if(typeof ip !== 'string'){ return res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: [{ field: "IP", message: 'Invalid IP address' }]})}

    const tokens = await this.authService.loginUser(loginOrEmail, password, userAgent, ip);

    if(tokens.status === ResultStatus.Unauthorized){ 
      return res.status(HttpStatus.UNAUTHORIZED).json({errorsMessages: tokens.extensions})};

    if(tokens.status === ResultStatus.Success && tokens.data){
     const [ accessToken, refreshToken ] = tokens.data;

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true }) 
         .status(HttpStatus.OK)
         .json({ accessToken });
    }

  } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}
