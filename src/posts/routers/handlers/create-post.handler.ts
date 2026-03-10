import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { mapToPostViewMolel } from "../mappers/map-to-post-model";
import { APIErrorResult } from "../../../common/utils/APIErrorResult";
import { blogsService } from "../../../blogs/domain/blogs.service";
import { postsService } from "../../domain/posts.service";

export async function createPostHandler(req: Request, res: Response) {
  try {
    const blogId = req.body.blogId;
    const blog = await blogsService.findByIdOrFail(blogId);

    if (!blog) {
      return res.status(HttpStatus.BAD_REQUEST).json(
        APIErrorResult([
          {
            message: "Blog not found",
            field: "id",
          },
        ]),
      );
    }

    const newPost = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      blogId: req.body.blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString()
    };

    const createPost = await postsService.createPost(newPost)
    const PostViewModel = mapToPostViewMolel(createPost)
    res.status(HttpStatus.CREATED).json(PostViewModel)
  } catch (err: unknown){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
