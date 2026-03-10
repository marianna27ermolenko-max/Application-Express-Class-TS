import { Response, Request } from "express";
import { postsService } from "../../../posts/domain/posts.service";
import { HttpStatus } from "../../../common/types/http.status";
import { blogsService } from "../../domain/blogs.service";
import { BlogsBlogIdQueryInput } from "../input/blogs-blogId-query-dto";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../common/helpers/set-default-sort-and-pagination";
import { mapToPostListPaginatedOutput } from "../../../posts/routers/mappers/map-to-post-list-paginated-output.util";
import { PostSortField } from "../../../posts/routers/input/post-sort-field";
import { APIErrorResult } from "../../../common/utils/APIErrorResult";
import { PostsQueryInput } from "../../../posts/routers/input/posts-query.input";
import { setDefaultPostPagination } from "../../../common/helpers/set-default-post-sort-and-pagination";

export async function getPostThroughBlogId(
  req: Request<{ blogId: string }, {}, {}, PostsQueryInput>,
  res: Response,
) {
  try {
    const blogId = req.params.blogId;
    console.log("blogId");
    
    const blog = await blogsService.findByIdOrFail(blogId);
    if (!blog) {
      return res.status(HttpStatus.NOT_FOUND).json(
        APIErrorResult([
          { message: "Blog not found", field: "blogId"}])
      );
    }

    const sanitizedQuery = matchedData<PostsQueryInput>(req, {
      locations: ["query"], // - "Бери данные только из req.query"
      includeOptionals: true, // -Верни даже необязательные поля, если они есть
    });

    const pageNumber = Number(sanitizedQuery.pageNumber);
    const pageSize = Number(sanitizedQuery.pageSize);

    //потом применяем дефолты(создаем функцию которая если нет значения добавляет дефолтное)
    const pagination = setDefaultPostPagination<PostSortField>({
     ...sanitizedQuery,
       pageNumber,
       pageSize
    });

    const { items, totalCount } = await postsService.findManyByBlogId(
      blogId,
      pagination,
    );

    const postsOutput = mapToPostListPaginatedOutput(items, {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
    });

    res.status(HttpStatus.OK).json(postsOutput);

  } catch (e: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
