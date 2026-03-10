import { Router } from "express";
import { createAuthUserHandler } from "./handlers/auth.create.login.user";
import { bodyAuthValidation } from "./middlewares/body.auth.validation";
import { inputValidationResultMiddleware } from "../../common/middlewareValidation/input-validtion-result.middleware";

export const authRouter = Router();

authRouter.post(
  "/login",
  bodyAuthValidation,
  inputValidationResultMiddleware,
  createAuthUserHandler,
);
