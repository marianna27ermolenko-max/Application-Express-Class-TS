import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { Blog } from "../../types/blog.type";
import { mapToBlogViewModel } from "../mappers/map-blog-view-model";
import { APIErrorResult } from "../../../common/utils/APIErrorResult";
import { BlogInputModel } from "../../dto/blog.dto.model";
import { BlogsService } from "../../domain/blogs.service";
import { BlogsQueryInput } from "../input/blogs-query.input";
import { PostCreateBlogIdDto } from "../input/post-blogId-body";
import { PostsQueryInput } from "../../../posts/api/input/posts-query.input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../common/helpers/set-default-sort-and-pagination";
import { BlogSortField } from "../input/blogs-sort-field";
import { mapToBlogListPaginatedOutput } from "../mappers/map-to-blog-list-paginated-output.util.ts";
import { setDefaultPostPagination } from "../../../common/helpers/set-default-post-sort-and-pagination";
import { PostSortField } from "../../../posts/api/input/post-sort-field";
import { mapToPostListPaginatedOutput } from "../../../posts/api/mappers/map-to-post-list-paginated-output.util";
import { Post } from "../../../posts/types/post.type";
import { mapToPostViewMolel } from "../../../posts/api/mappers/map-to-post-model";
import { PostsQwRepository } from "../../../posts/repositories/post-query.repositories";
import { PostsService } from "../../../posts/domain/posts.service";
import { inject, injectable } from "inversify";


@injectable()
export class BlogsController {

blogsService: BlogsService; 
postsQwRepo: PostsQwRepository;
postsService: PostsService;

constructor(@inject(BlogsService) blogsService: BlogsService, @inject(PostsQwRepository) postsQwRepo: PostsQwRepository, 
@inject(PostsService) postsService: PostsService){

    this.blogsService = blogsService;
    this.postsQwRepo = postsQwRepo;
    this.postsService = postsService;
}   

async createBlogHandler(req: Request<{}, {}, BlogInputModel>, res: Response){

  try{
    const newBlog = new Blog (   
    req.body.name,
    req.body.description,
    req.body.websiteUrl,
    new Date().toISOString(),
    false,
  )
  
  const createBlog = await this.blogsService.createBlog(newBlog);

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

 async  createBlogIdPost(req: Request<{blogId: string}, {}, PostCreateBlogIdDto>, res: Response){

try{
const blogId = req.params.blogId;
const blog = await this.blogsService.findById(blogId);

const { title, shortDescription, content } = req.body;
  

  if (!blog) {      
      return res.status(HttpStatus.NOT_FOUND).json(
        APIErrorResult([
          {
            message: "Blog not found",
            field: "blogId",
          },
        ]),
      ); }

const newPost =  new Post (
    title,
    shortDescription,
    content,
    req.params.blogId,
    blog.name,
    new Date().toISOString(),
);

// const newPost: Post = {
//     title,
//     shortDescription,
//     content,
//     blogId: req.params.blogId,
//     blogName: blog.name,
//     createdAt: new Date().toISOString()
// };


const createPost = await this.postsService.createPost(newPost); 
const createPostViewModel = mapToPostViewMolel(createPost);

res.status(HttpStatus.CREATED).json(createPostViewModel)
}catch(e: unknown){
   
res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}
}


 async deleteBlogHandler(req: Request<{id: string}>, res: Response){
try{
        const id = req.params.id;
        const deleteBlog = await this.blogsService.findById(id);

        if(!deleteBlog){
            res.status(HttpStatus.NOT_FOUND).send(
              APIErrorResult([{field: 'id', message: 'Blog not found' }])
            );
            return;
        }
         await this.blogsService.deleteBlog(id);
         res.sendStatus(HttpStatus.NO_CONTENT);
} catch (err: any){
  res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}}


async  getBlogHandler(req: Request<{id: string}>, res: Response){ 
try{
      const id = req.params.id;
      const blog = await this.blogsService.findBlogById(id); 
      if (!blog) {
        return res.sendStatus(HttpStatus.NOT_FOUND);
      }
      res.status(HttpStatus.OK).json(blog);
    } catch (err: unknown){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


async  getBlogsListHandler(req: Request<{}, {}, {}, BlogsQueryInput>, res: Response){


  try{
      
      //matchedData — это функция из библиотеки express-validator. Она достаёт из запроса только те поля, которые прошли валидаторы. 
      const sanitizedQuery = matchedData<BlogsQueryInput>(req, {  
      locations: ['query'], // - "Бери данные только из req.query"
      includeOptionals: true, // -Верни даже необязательные поля, если они есть
    }); 

    const pageNumber = Number(sanitizedQuery.pageNumber);
    const pageSize = Number(sanitizedQuery.pageSize);

    //потом применяем дефолты(создаем функцию которая если нет значения добавляет дефолтное)
    const pagination = setDefaultSortAndPaginationIfNotExist<BlogSortField>({
      ...sanitizedQuery,
       pageNumber,
       pageSize});
    
    const { items, totalCount }  = await this.blogsService.findMany(pagination); 

     const blogsListOutput = mapToBlogListPaginatedOutput(items, {
      pageNumber: Number(pagination.pageNumber),
      pageSize: Number(pagination.pageSize),
      totalCount,
    });

    res.status(HttpStatus.OK).json(blogsListOutput);
  } catch (err: unknown){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 


async  getPostThroughBlogId(
  req: Request<{ blogId: string }, {}, {}, PostsQueryInput>,
  res: Response,
) {
  try {
    const blogId = req.params.blogId;
    
    const blog = await this.blogsService.findById(blogId);
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

    const { items, totalCount } = await this.postsQwRepo.findManyBlogId(
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


async updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputModel>,
  res: Response,
) {
  try {
    const id = req.params.id;

    const blogReal = await this.blogsService.findById(id);

    if (!blogReal) {
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    const dto: BlogInputModel = {
      name: req.body.name,
      description: req.body.description,
      websiteUrl: req.body.websiteUrl,
    };

 await this.blogsService.updateBlog(id, dto);
    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (err: unknown){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}

