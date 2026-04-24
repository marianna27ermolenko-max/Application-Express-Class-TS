import { Response, Request } from "express"; 
import { HttpStatus } from "../../../common/types/http.status";
import { PostInputModel } from "../../dto/post.dto.view.input";
import { APIErrorResult } from "../../../common/utils/APIErrorResult";
import { PostsService } from "../../domain/posts.service";
import { BlogsService } from "../../../blogs/domain/blogs.service";
import { matchedData } from "express-validator";
import { setDefaultPostPagination } from "../../../common/helpers/set-default-post-sort-and-pagination";
import { PostsQwRepository } from "../../repositories/post-query.repositories";
import { PostSortField } from "../input/post-sort-field";
import { PostsQueryInput } from "../input/posts-query.input";
import { mapToPostListPaginatedOutput } from "../mappers/map-to-post-list-paginated-output.util";
import { PostIdType } from "../../../common/types/id";
import { RequestWithParamsAndBody, RequestWithParamsAndQuery } from "../../../common/types/requests";
import { CommentSortField } from "../input/comment-sort-field";
import { CommentsQueryInput } from "../input/post-comments-query.input";
import { mapToPostViewMolel } from "../mappers/map-to-post-model";
import { UsersQwRepository } from "../../../users/infrastructure/user.query.repository";
import { CommentBodyByPost } from "../input/post-comments-body";
import { inject, injectable } from "inversify";

@injectable()
export class PostController {
  
postsService: PostsService;
blogsService: BlogsService;
usersQwRepo: UsersQwRepository;
postsQwRepo: PostsQwRepository;

constructor(@inject(PostsService) postsService: PostsService, @inject(BlogsService) blogsService: BlogsService,
            @inject(UsersQwRepository) usersQwRepo: UsersQwRepository, @inject(PostsQwRepository) postsQwRepo: PostsQwRepository
){
  this.postsService = postsService,
  this.blogsService = blogsService,
  this.usersQwRepo = usersQwRepo,
  this.postsQwRepo = postsQwRepo
}

 async updatePostHandler (req: Request<{id: string}, {}, PostInputModel>, res: Response){
try{
   const id = req.params.id;
   const post =  await this.postsService.findPostById(id);
   
   if(!post){
   return res.sendStatus(HttpStatus.NOT_FOUND)}

   const blog = await this.blogsService.findById(req.body.blogId);
    if(!blog){
   return res.status(HttpStatus.BAD_REQUEST).json(
              APIErrorResult([{field: 'blogId', message: 'Blog not found' }])
            )}

   const dto = { 
   title: req.body.title,
   shortDescription: req.body.shortDescription,
   content: req.body.content,
   blogId: req.body.blogId,
   };

   await this.postsService.updatePost(id, dto); //СЕРВЕС ОДИН РАЗ ДОЛЖЕН ВЫЗЫВАТЬСЯ !!! ЛОГИКУ ПЕРЕПИСАТЬ
   res.sendStatus(HttpStatus.NO_CONTENT); 
} catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

 async  getPostListHandler(req: Request<{}, {}, {}, PostsQueryInput>, res: Response){ 
try{
    
const sanitazedQuery = matchedData<PostsQueryInput>(req, {  
      locations: ['query'], // - "Бери данные только из req.query"
      includeOptionals: true, // - Верни даже необязательные поля, если они есть
    }); 
  
const pagination = setDefaultPostPagination<PostSortField>(sanitazedQuery); 

const { items, totalCount } = await  this.postsQwRepo.findMany(pagination);

const postListOutput = mapToPostListPaginatedOutput(items, {
   pageNumber: pagination.pageNumber,
   pageSize: pagination.pageSize,
   totalCount,
})

res.status(HttpStatus.OK).json(postListOutput);   
} catch (err: any){
  res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}} 

 async getByPostIdCommentHandler(
  req: RequestWithParamsAndQuery<PostIdType, CommentsQueryInput>,
  res: Response,
) {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    const post = await  this.postsQwRepo.findPostById(postId);
    if(!post) return res.sendStatus(HttpStatus.NOT_FOUND);

    const sanitazedQuery = matchedData<CommentsQueryInput>(req, {
      locations: ["query"], // - "Бери данные только из req.query"
      includeOptionals: true, // - Верни даже необязательные поля, если они есть
    });

    const pagination = setDefaultPostPagination<CommentSortField>(sanitazedQuery);

    const listComments =  await  this.postsQwRepo.findManyCommentsByPostId( postId, pagination );

    console.log(listComments)

    return res.status(HttpStatus.OK).json(listComments);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

 async  getPostHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const id = req.params.id;
    const getIdPost = await  this.postsQwRepo.findPostById(id);

    if (!getIdPost) {
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }
    res.status(HttpStatus.OK).json(mapToPostViewMolel(getIdPost));
  } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

 async deletePostHandler(
  req: Request<{ id: string }>,
  res: Response,
){
  try {
    const id = req.params.id;
    const post = await this.postsService.findPostById(id);
    if (!post){
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }
    await this.postsService.deletePost(id);
    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

 async createByPostIdCommentHandler(req: RequestWithParamsAndBody<PostIdType, CommentBodyByPost>, res: Response){

    try{
    const postId = req.params.postId;

    const correctUser = await this.usersQwRepo.findUserById(req.userId!);
    if(!correctUser) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    const post = await this.postsService.findPostById(req.params.postId);
    if(!post) return res.sendStatus(HttpStatus.NOT_FOUND);

    const newComment = {
        content: req.body.content,
        postId,
        commentatorInfo: {
            userId: req.userId!,
            userLogin: correctUser.login,
        },
        createdAt: new Date().toISOString()
    }

    const createComment = await this.postsService.createCommentByPostId(newComment); //здесь словили нашу айдишку и гоу в гет
    const comment = await this.postsQwRepo.findCommentById(createComment);

    res.status(HttpStatus.CREATED).json(comment);
        
    }catch(e: unknown){
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }

}

 async createPostHandler(req: Request, res: Response) {
  try {
    const blogId = req.body.blogId;
    const blog = await this.blogsService.findById(blogId);

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

    const createPost = await this.postsService.createPost(newPost) //надо переписать на квери - вернуть здесь айди и отправить на выдачу в квери он вернет обьет промапить

    const PostViewModel = mapToPostViewMolel(createPost)
    res.status(HttpStatus.CREATED).json(PostViewModel)
  } catch (err: unknown){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

}


