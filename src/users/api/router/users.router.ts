
import { Router } from "express";
import { paginationAndSortingValidation } from "../../../common/middlewareValidation/query.pagination-sorting"; 
import { searchTermValidation } from "../middlewares/query.searchname"; 
import { inputValidationResultMiddleware } from "../../../common/middlewareValidation/input-validtion-result.middleware";
import { idValidation } from "../../../common/middlewareValidation/params-id.validation-middleware";
import { bodyUsersValidation } from "../middlewares/body.user.validation"; 
import { superAdminGuardMiddleware } from "../../../auth/guard/super-admin.guard-middleware";
import { UserSortFields } from "../controller/input/user-sort-field"; 
import { container } from "../../../composition-root";
import { UsersController } from "../controller/controller.users.class"; 

const usersController = container.resolve(UsersController); 

export const usersRouter = Router();

console.log(" USERS ROUTER FILE LOADED");

usersRouter
  .get("/", superAdminGuardMiddleware, paginationAndSortingValidation(UserSortFields), searchTermValidation, inputValidationResultMiddleware, usersController.getUsersHandler.bind(usersController))
  .post("/", superAdminGuardMiddleware, bodyUsersValidation, inputValidationResultMiddleware, usersController.createUserHandler.bind(usersController))
  .delete("/:id", superAdminGuardMiddleware, idValidation, inputValidationResultMiddleware, usersController.deleteUserHandler.bind(usersController));
 