import { Router } from "express";
import { jwtTokenGuardMiddleware } from "../../auth/guard/jwt.token.guard-middleware";
import { inputValidationResultMiddleware } from "../../common/middlewareValidation/input-validtion-result.middleware";
import { commentIdValidation, idValidation } from "../../common/middlewareValidation/params-id.validation-middleware";
import { commentByPostIdInputValidationMiddleware } from "../../posts/validation/post.body-validation-middleware";
import { container } from "../../composition-root";
import { CommentsController } from "./handlers/commentsHandler";
// import { commentsController } from "../../composition-root";

const commentsController = container.resolve(CommentsController);

export const commentsRouter = Router();

commentsRouter
.get('/:id', idValidation, commentsController.getCommentHandler.bind(commentsController))
.put('/:commentId', jwtTokenGuardMiddleware, commentIdValidation, commentByPostIdInputValidationMiddleware, inputValidationResultMiddleware, commentsController.updateCommentHandler.bind(commentsController))
.delete('/:commentId', jwtTokenGuardMiddleware, commentIdValidation, inputValidationResultMiddleware, commentsController.deleteCommentHandler.bind(commentsController))