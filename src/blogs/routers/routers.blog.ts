// import { getBlogsListHandler } from "./handlers/get-blogs.list.handler";
// import { createBlogHandler } from "./handlers/create-blog.handler";
// import { getBlogHandler } from "./handlers/get-blog.handler";
// import { updateBlogHandler } from "./handlers/update-blog.handler";
// import { deleteBlogHandler } from "./handlers/delete-blog.handler";
// import { createBlogIdPost } from "./handlers/create-post-blogId.handler";
// import { getPostThroughBlogId } from "./handlers/get-post_blog_id_blog.handler";
import { Router } from "express";
import { superAdminGuardMiddleware } from "../../auth/guard/super-admin.guard-middleware";
import {
  blogIdValidation,
  idValidation,
} from "../../common/middlewareValidation/params-id.validation-middleware";
import { blogInputDTOValidationMiddleware } from "../validation/blog.body-validation-middleware";
import { inputValidationResultMiddleware } from "../../common/middlewareValidation/input-validtion-result.middleware";
import { paginationAndSortingValidation } from "../../common/middlewareValidation/query.pagination-sorting";
import { BlogSortField } from "./input/blogs-sort-field";
import { PostSortField } from "../../posts/api/input/post-sort-field";
import { postInputWithoutBlogIdValidationMiddleware } from "../../posts/validation/post.body-validation-middleware";
import { searchQueryValidation } from "../validation/query.search.blog.validation";
import { container } from "../../composition-root";
import { BlogsController } from "./handlers/blogsHandlers";

const blogsController = container.resolve(BlogsController);

export const blogsRouter = Router();

blogsRouter
  .get(
    "/",
    paginationAndSortingValidation(BlogSortField),
    searchQueryValidation,
    inputValidationResultMiddleware,
    blogsController.getBlogsListHandler.bind(blogsController),
  )
  .get("/:id", idValidation, inputValidationResultMiddleware, blogsController.getBlogHandler.bind(blogsController))
  .get(
    "/:blogId/posts",
    blogIdValidation,
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    blogsController.getPostThroughBlogId.bind(blogsController),
  )
  .post(
    "/",
    superAdminGuardMiddleware,
    blogInputDTOValidationMiddleware,
    inputValidationResultMiddleware,
    blogsController.createBlogHandler.bind(blogsController),
  )
  .post(
    "/:blogId/posts",
    superAdminGuardMiddleware,
    postInputWithoutBlogIdValidationMiddleware,
    inputValidationResultMiddleware,
    blogsController.createBlogIdPost.bind(blogsController),
  )
  .put(
    "/:id",
    superAdminGuardMiddleware,
    idValidation,
    blogInputDTOValidationMiddleware,
    inputValidationResultMiddleware,
    blogsController.updateBlogHandler.bind(blogsController),
  )
  .delete(
    "/:id",
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    blogsController.deleteBlogHandler.bind(blogsController),
  );
