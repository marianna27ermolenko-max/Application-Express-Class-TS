import { Router } from 'express';
import { superAdminGuardMiddleware } from '../../auth/guard/super-admin.guard-middleware';
import { idValidation, postIdValidation } from '../../common/middlewareValidation/params-id.validation-middleware';
import { inputValidationResultMiddleware } from '../../common/middlewareValidation/input-validtion-result.middleware';
import { commentByPostIdInputValidationMiddleware, postInputValidationMiddleware } from '../validation/post.body-validation-middleware';
import { paginationAndSortingValidation } from '../../common/middlewareValidation/query.pagination-sorting';
import { PostSortField } from './input/post-sort-field';
import { jwtTokenGuardMiddleware } from '../../auth/guard/jwt.token.guard-middleware';
import { CommentSortField } from './input/comment-sort-field';
import { container } from '../../composition-root';
import { PostController } from './handlers/handler.posts';
import { optionalAuthMiddleware } from '../../auth/guard/jwt.access.token.optional';
import { likeBodyValidation } from '../../comments/api/middleware/body.like.validation';

const postController = container.resolve(PostController);

export const postsRouter = Router();

postsRouter 
.get('/', optionalAuthMiddleware, paginationAndSortingValidation(PostSortField), inputValidationResultMiddleware, postController.getPostListHandler.bind(postController))
.get('/:postId/comments', optionalAuthMiddleware, postIdValidation, paginationAndSortingValidation(CommentSortField), inputValidationResultMiddleware, postController.getByPostIdCommentHandler.bind(postController))
.get('/:id', optionalAuthMiddleware, idValidation, inputValidationResultMiddleware, postController.getPostHandler.bind(postController))

.post('/:postId/comments', jwtTokenGuardMiddleware, postIdValidation, commentByPostIdInputValidationMiddleware, inputValidationResultMiddleware, postController.createByPostIdCommentHandler.bind(postController))
.post('/', superAdminGuardMiddleware, postInputValidationMiddleware, inputValidationResultMiddleware, postController.createPostHandler.bind(postController))

.put('/:id', superAdminGuardMiddleware, idValidation, postInputValidationMiddleware, inputValidationResultMiddleware, postController.updatePostHandler.bind(postController))
.put('/:postId/like-status', jwtTokenGuardMiddleware, postIdValidation, likeBodyValidation, inputValidationResultMiddleware, postController.updatePostLikeStatusController.bind(postController))

.delete('/:id', superAdminGuardMiddleware, idValidation, inputValidationResultMiddleware, postController.deletePostHandler.bind(postController))