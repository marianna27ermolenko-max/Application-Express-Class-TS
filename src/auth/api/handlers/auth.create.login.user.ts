import { RequestWithBody } from "../../../common/types/requests";
import { Response } from "express";
import { LoginDto } from "../../types/login.dto";
import { authServer } from "../../domain/auth.service";
import { HttpStatus } from "../../../common/types/http.status";
import { APIErrorResult } from "../../../common/utils/APIErrorResult";

export async function createAuthUserHandler(
  req: RequestWithBody<LoginDto>,
  res: Response,
) {
  try {
    const { loginOrEmail, password } = req.body;

    const accessToken = await authServer.loginUser(loginOrEmail, password);

    if (!accessToken)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          APIErrorResult([
            {
              message: "If the password or login is wrong",
              field: "loginOrEmail",
            },
          ]),
        );

    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
