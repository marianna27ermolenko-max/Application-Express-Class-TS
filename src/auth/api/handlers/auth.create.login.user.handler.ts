import { RequestWithBody } from "../../../common/types/requests";
import { Response } from "express";
import { LoginDto } from "../../types/login.dto";
import { authServer } from "../../domain/auth.service";`~~`
import { HttpStatus } from "../../../common/types/http.status";
import { ResultStatus } from "../../../common/result/resultCode";


export async function createAuthUserHandler(
  req: RequestWithBody<LoginDto>,
  res: Response,
) {
  try {

    const { loginOrEmail, password } = req.body;
    const tokens = await authServer.loginUser(loginOrEmail, password);

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
