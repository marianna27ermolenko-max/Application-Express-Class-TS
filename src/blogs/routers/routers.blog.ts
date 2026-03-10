import { Router } from "express";
import { superAdminGuardMiddleware } from "../../auth/guard/super-admin.guard-middleware";
import {
  blogIdValidation,
  idValidation,
} from "../../common/middlewareValidation/params-id.validation-middleware";
import { blogInputDTOValidationMiddleware } from "../validation/blog.body-validation-middleware";
import { inputValidationResultMiddleware } from "../../common/middlewareValidation/input-validtion-result.middleware";
import { getBlogsListHandler } from "./handlers/get-blogs.list.handler";
import { createBlogHandler } from "./handlers/create-blog.handler";
import { getBlogHandler } from "./handlers/get-blog.handler";
import { updateBlogHandler } from "./handlers/update-blog.handler";
import { deleteBlogHandler } from "./handlers/delete-blog.handler";
import { paginationAndSortingValidation } from "../../common/middlewareValidation/query.pagination-sorting";
import { BlogSortField } from "./input/blogs-sort-field";
import { getPostThroughBlogId } from "./handlers/get-post_blog_id_blog.handler";
import { PostSortField } from "../../posts/routers/input/post-sort-field";
import { postInputWithoutBlogIdValidationMiddleware } from "../../posts/validation/post.body-validation-middleware";
import { createBlogIdPost } from "./handlers/create-post-blogId.handler";
import { searchQueryValidation } from "../validation/query.search.blog.validation";

export const blogsRouter = Router();

blogsRouter
  .get(
    "/",
    paginationAndSortingValidation(BlogSortField),
    searchQueryValidation,
    inputValidationResultMiddleware,
    getBlogsListHandler,
  )
  .get("/:id", 
    idValidation, 
    inputValidationResultMiddleware, 
    getBlogHandler)
  .get(
    "/:blogId/posts",
    blogIdValidation,
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    getPostThroughBlogId,
  )
  .post(
    "/",
    superAdminGuardMiddleware,
    blogInputDTOValidationMiddleware,
    inputValidationResultMiddleware,
    createBlogHandler,
  )
  .post('/:blogId/posts', 
    superAdminGuardMiddleware, 
    postInputWithoutBlogIdValidationMiddleware,
    inputValidationResultMiddleware,  
    createBlogIdPost) 
  .put(
    "/:id",
    superAdminGuardMiddleware,
    idValidation,
    blogInputDTOValidationMiddleware,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )
  .delete(
    "/:id",
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  )
 

