import { Router } from "express";
import { createUserHandler } from "./handlers/create-user.handler";
import { deleteUserHandler } from "./handlers/delete-user.handler";
import { getUsersHandler } from "./handlers/get-users.handler";
import { paginationAndSortingValidation } from "../../common/middlewareValidation/query.pagination-sorting";
import { searchTermValidation } from "./middlewares/query.searchname";
import { inputValidationResultMiddleware } from "../../common/middlewareValidation/input-validtion-result.middleware";
import { idValidation } from "../../common/middlewareValidation/params-id.validation-middleware";
import { bodyUsersValidation } from "./middlewares/body.user.validation";
import { superAdminGuardMiddleware } from "../../auth/guard/super-admin.guard-middleware";
import { UserSortFields } from "./handlers/input/user-sort-field";

export const usersRouter = Router();

usersRouter
  .get("/", superAdminGuardMiddleware, paginationAndSortingValidation(UserSortFields), searchTermValidation, inputValidationResultMiddleware, getUsersHandler)
  .post("/", superAdminGuardMiddleware, bodyUsersValidation, inputValidationResultMiddleware, createUserHandler)
  .delete("/:id", superAdminGuardMiddleware, idValidation, inputValidationResultMiddleware, deleteUserHandler);
 