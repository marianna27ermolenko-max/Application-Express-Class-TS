
// import { getNewPasswordHandler } from "./handlers/auth.new_password";
// import { recoveryPasswordHandler } from "./handlers/auth.password-recovery";
// import { userRegistrationHandler } from "./handlers/auth.registration.handler";
// import { registrationEmailResendingHandler } from "./handlers/auth.registration-email-resending.handler";
// import { userRegistrationConfirmationHandler } from "./handlers/auth.registration-confirmation.handler";
// import { logoutHandler } from "./handlers/auth.logout.handler";
// import { createRefreshTokenHandler } from "./handlers/auth.refresh-token.handler";
// import { getAuthUserHandler } from "./handlers/auth.get.me.handler";
// import { createAuthUserHandler } from "./handlers/auth.create.login.user.handler";

import { Router } from "express";
import { bodyAuthNewPassword, bodyAuthRegistration, bodyAuthValidation, codeValidation, emailValidation } from "./middlewares/body.auth.validation";
import { inputValidationResultMiddleware } from "../../common/middlewareValidation/input-validtion-result.middleware";
import { jwtTokenGuardMiddleware } from "../guard/jwt.token.guard-middleware";
import { jwtRefreshTokenGuardMiddleware } from "../guard/jwt.refresh.token.guard-middleware";
import { customRateLimit } from "../../common/custom-rate-limit/middleware/customRateLimit.middleware";
import { container } from "../../composition-root";
import { AuthController } from "./handlers/authHandlers";

const authController = container.resolve(AuthController);

export const authRouter = Router();

authRouter
.post('/login', customRateLimit, bodyAuthValidation, inputValidationResultMiddleware, authController.createAuthUserHandler.bind(authController))
.post('/registration-confirmation',  customRateLimit, codeValidation, inputValidationResultMiddleware, authController.userRegistrationConfirmationHandler.bind(authController))
.post('/registration', customRateLimit, bodyAuthRegistration, inputValidationResultMiddleware, authController.userRegistrationHandler.bind(authController)) 
.post('/registration-email-resending',  customRateLimit, emailValidation, authController.registrationEmailResendingHandler.bind(authController))
.post('/logout', jwtRefreshTokenGuardMiddleware, inputValidationResultMiddleware, authController.logoutHandler.bind(authController))
.post('/refresh-token', jwtRefreshTokenGuardMiddleware, inputValidationResultMiddleware, authController.createRefreshTokenHandler.bind(authController))
.post('/password-recovery', customRateLimit, emailValidation, inputValidationResultMiddleware, authController.recoveryPasswordHandler.bind(authController))
.post('/new-password', customRateLimit, bodyAuthNewPassword, inputValidationResultMiddleware, authController.getNewPasswordHandler.bind(authController))
.get('/me', jwtTokenGuardMiddleware, inputValidationResultMiddleware, authController.getAuthUserHandler.bind(authController))


