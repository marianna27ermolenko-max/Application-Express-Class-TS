import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { Blog } from "../../types/blog.type";
import { mapToBlogViewModel } from "../mappers/map-blog-view-model";
import { APIErrorResult } from "../../../common/utils/APIErrorResult";
import { BlogInputModel } from "../../dto/blog.dto.model";
import { blogsService } from "../../domain/blogs.service";

export async function createBlogHandler(req: Request<{}, {}, BlogInputModel>, res: Response){

  try{
    const newBlog: Blog = {   
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  }
  
  const createBlog = await blogsService.createBlog(newBlog);
  const BlogViewModel = mapToBlogViewModel(createBlog);
  res.status(HttpStatus.CREATED).json(BlogViewModel);

} catch (err: any){
const errors = [
  {
     message: err.message ?? "Unknown error",
     field: "blog",
  }
]
res.status(HttpStatus.BAD_REQUEST).json(APIErrorResult(errors)) 
};
}  