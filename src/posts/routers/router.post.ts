import { Router } from 'express';
import { superAdminGuardMiddleware } from '../../auth/guard/super-admin.guard-middleware';
import { idValidation } from '../../common/middlewareValidation/params-id.validation-middleware';
import { inputValidationResultMiddleware } from '../../common/middlewareValidation/input-validtion-result.middleware';
import { createPostHandler } from './handlers/create-post.handler';
import { updatePostHandler } from './handlers/update-post.handler';
import { getPostListHandler } from './handlers/get-posts.list.handler';
import { getPostHandler } from './handlers/get-post.handler';
import { deletePostHandler } from './handlers/delete-post.handler';
import { postInputValidationMiddleware } from '../validation/post.body-validation-middleware';
import { paginationAndSortingValidation } from '../../common/middlewareValidation/query.pagination-sorting';
import { PostSortField } from './input/post-sort-field';

export const postsRouter = Router();

postsRouter 
.get('/', paginationAndSortingValidation(PostSortField), inputValidationResultMiddleware, getPostListHandler)
.post('/', superAdminGuardMiddleware, postInputValidationMiddleware, inputValidationResultMiddleware, createPostHandler)
.get('/:id', idValidation, inputValidationResultMiddleware, getPostHandler)
.put('/:id', superAdminGuardMiddleware, idValidation, postInputValidationMiddleware, inputValidationResultMiddleware, updatePostHandler)
.delete('/:id', superAdminGuardMiddleware, idValidation, inputValidationResultMiddleware, deletePostHandler)