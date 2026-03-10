import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { blogsService } from "../../domain/blogs.service";
import { PostCreateBlogIdDto } from "../input/post-blogId-body";
import { Post } from "../../../posts/types/post.type";
import { APIErrorResult } from "../../../common/utils/APIErrorResult";
import { mapToPostViewMolel } from "../../../posts/routers/mappers/map-to-post-model";
import { postsService } from "../../../posts/domain/posts.service";

export async function createBlogIdPost(req: Request<{blogId: string}, {}, PostCreateBlogIdDto>, res: Response){

try{
const blogId = req.params.blogId;
const blog = await blogsService.findByIdOrFail(blogId);
  

  if (!blog) {
      console.log('🔥 4. Blog NOT FOUND → 404');
      return res.status(HttpStatus.NOT_FOUND).json(
        APIErrorResult([
          {
            message: "Blog not found",
            field: "blogId",
          },
        ]),
      );
    }

const newPost: Post = {
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId: req.params.blogId,
    blogName: blog.name,
    createdAt: new Date().toISOString()
};


const createPost = await postsService.createPost(newPost); 
const createPostViewModel = mapToPostViewMolel(createPost);

res.status(HttpStatus.CREATED).json(createPostViewModel)
}catch(e: unknown){
   
res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}
};