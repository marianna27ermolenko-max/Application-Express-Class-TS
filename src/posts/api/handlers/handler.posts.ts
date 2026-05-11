import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { PostInputModel } from "../../dto/post.dto.view.input";
import { PostsService } from "../../application/posts.service";
import { BlogsService } from "../../../blogs/application/blogs.service";
import { matchedData } from "express-validator";
import { setDefaultPostPagination } from "../../../common/helpers/set-default-post-sort-and-pagination";
import { PostsQwRepository } from "../../repositories/post-query.repositories";
import { PostSortField } from "../input/post-sort-field";
import { PostsQueryInput } from "../input/posts-query.input";
import { PostIdType } from "../../../common/types/id";
import {
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
} from "../../../common/types/requests";
import { CommentSortField } from "../input/comment-sort-field";
import { CommentsQueryInput } from "../input/post-comments-query.input";
import { UsersQwRepository } from "../../../users/infrastructure/user.query.repository";
import { CommentBodyByPost } from "../input/post-comments-body";
import { inject, injectable } from "inversify";
import { ResultStatus } from "../../../common/result/resultCode";
import { LikeStatus } from "../../../comments/domain/like.comment.entity";

@injectable()
export class PostController {
  postsService: PostsService;
  blogsService: BlogsService;
  usersQwRepo: UsersQwRepository;
  postsQwRepo: PostsQwRepository;

  constructor(
    @inject(PostsService) postsService: PostsService,
    @inject(BlogsService) blogsService: BlogsService,
    @inject(UsersQwRepository) usersQwRepo: UsersQwRepository,
    @inject(PostsQwRepository) postsQwRepo: PostsQwRepository,
  ) {
    ((this.postsService = postsService),
      (this.blogsService = blogsService),
      (this.usersQwRepo = usersQwRepo),
      (this.postsQwRepo = postsQwRepo));
  }

  async updatePostHandler(
    req: Request<{ id: string }, {}, PostInputModel>,
    res: Response,
  ) {
    try {
      const result = await this.postsService.updatePost(
        req.params.id,
        req.body,
      );
      if (result.status === ResultStatus.BadRequest) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ errorsMessages: result.extensions });
      }
      if (result.status === ResultStatus.NotFound) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ errorsMessages: result.extensions });
      }
      if (result.status === ResultStatus.Success) {
        return res.sendStatus(HttpStatus.NO_CONTENT);
      }
    } catch (err: unknown) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPostListHandler(
    req: Request<{}, {}, {}, PostsQueryInput>,
    res: Response,
  ) {
    try {
      const userId = req.userId || undefined;

      const sanitazedQuery = matchedData<PostsQueryInput>(req, {
        locations: ["query"], // - "Бери данные только из req.query"
        includeOptionals: true, // - Верни даже необязательные поля, если они есть
      });

      const pagination =
        setDefaultPostPagination<PostSortField>(sanitazedQuery);

      const postListOutput = await this.postsQwRepo.findMany(pagination, userId);
      return res.status(HttpStatus.OK).json(postListOutput);

    } catch (err: any) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getByPostIdCommentHandler(
    req: RequestWithParamsAndQuery<PostIdType, CommentsQueryInput>,
    res: Response,
  ) {
    try {
      const userId = req.userId ?? undefined;
      const postId = req.params.postId;
      if (!postId) {
        return res.sendStatus(HttpStatus.NOT_FOUND);
      }

      const post = await this.postsQwRepo.findPostById(postId, userId);
      if (!post) return res.sendStatus(HttpStatus.NOT_FOUND);

      const sanitazedQuery = matchedData<CommentsQueryInput>(req, {
        locations: ["query"], // - "Бери данные только из req.query"
        includeOptionals: true, // - Верни даже необязательные поля, если они есть
      });

      const pagination =
        setDefaultPostPagination<CommentSortField>(sanitazedQuery);

      const listComments = await this.postsQwRepo.findManyCommentsByPostId(
        postId,
        pagination,
        userId,
      );

      return res.status(HttpStatus.OK).json(listComments);
    } catch (e: unknown) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPostHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = req.userId ?? undefined;
      const id = req.params.id;

      const getIdPost = await this.postsQwRepo.findPostById(id, userId);

      if (!getIdPost) { return res.sendStatus(HttpStatus.NOT_FOUND ); }

      res.status(HttpStatus.OK).json(getIdPost);
    } catch (err: unknown) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePostHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const result = await this.postsService.deletePost(req.params.id);
      if (result.status === ResultStatus.NotFound) {
        return res.sendStatus(HttpStatus.NOT_FOUND);
      }
      if (result.status === ResultStatus.Success) {
        return res.sendStatus(HttpStatus.NO_CONTENT);
      }
    } catch (err: unknown) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createByPostIdCommentHandler(
    req: RequestWithParamsAndBody<PostIdType, CommentBodyByPost>,
    res: Response,
  ) {
    try {
      const createComment = await this.postsService.createCommentByPostId(
        req.params.postId,
        req.body,
        req.userId!,
      );
      if (createComment.status === ResultStatus.BadRequest) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ errorsMessages: createComment.extensions });
      }
      if (createComment.status === ResultStatus.NotFound) {
        return res.sendStatus(HttpStatus.NOT_FOUND);
      }
      if (createComment.status === ResultStatus.Unauthorized) {
        return res.sendStatus(HttpStatus.UNAUTHORIZED);
      }

      const comment = await this.postsQwRepo.findCommentById(
        createComment.data!,
      );

      console.log("created id", createComment.data);
      console.log("found comment", comment);

      return res.status(HttpStatus.CREATED).json(comment);
    } catch (e: unknown) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createPostHandler(req: Request, res: Response) {
    try {
      const createPost = await this.postsService.createPost(req.body);
      if (createPost.status === ResultStatus.BadRequest) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ errorsMessages: createPost.extensions });
      }

      const post = await this.postsQwRepo.findPostById(createPost.data!);

      return res.status(HttpStatus.CREATED).json(post);
    } catch (err: unknown) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePostLikeStatusController(
    req: Request<{ postId: string }, {}, { likeStatus: LikeStatus }>,
    res: Response,
  ) {
    try {
      const userId = req.userId;
      const postId = req.params.postId;
      const likeStatus = req.body.likeStatus;

      const result = await this.postsService.updatePostLikeStatus(userId!, postId, likeStatus );
      if (result.status === ResultStatus.BadRequest){ return res.status(HttpStatus.BAD_REQUEST).json({ errorsMessages: result.extensions })}
      if (result.status === ResultStatus.NotFound){ return res.sendStatus(HttpStatus.NOT_FOUND);}
      if (result.status === ResultStatus.Unauthorized){return res.sendStatus(HttpStatus.UNAUTHORIZED)}

      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err: unknown) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
