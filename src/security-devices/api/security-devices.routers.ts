import { Router } from "express";
import { jwtRefreshTokenGuardMiddleware } from "../../auth/guard/jwt.refresh.token.guard-middleware";
import { inputValidationResultMiddleware } from "../../common/middlewareValidation/input-validtion-result.middleware";
import { deviceIdValidation } from "../../common/middlewareValidation/params-id.validation-middleware";
import { container } from "../../composition-root";
import { SecurityDevicesController } from "./handlers/handler.security-devices";
// import { securityDevicesController } from "../../composition-root";

const securityDevicesController = container.resolve(SecurityDevicesController);

export const securityDevicesRouter = Router();

securityDevicesRouter
.get('/', jwtRefreshTokenGuardMiddleware, inputValidationResultMiddleware, securityDevicesController.getDevicesHandler.bind(securityDevicesController))
.delete('/', jwtRefreshTokenGuardMiddleware, inputValidationResultMiddleware, securityDevicesController.deleteAllDevicesHandler.bind(securityDevicesController))
.delete('/:deviceId', deviceIdValidation, jwtRefreshTokenGuardMiddleware, inputValidationResultMiddleware, securityDevicesController.deleteDeviceHandler.bind(securityDevicesController))