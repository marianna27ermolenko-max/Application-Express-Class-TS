import { PostDocument, PostModel } from "../domain/post.entity";
import { PostInputModel } from "../dto/post.dto.view.input";
import { PostsRepository } from "../repositories/post-repositories";
import { inject, injectable } from "inversify";
import { Result } from "../../common/result/result.type";
import { BlogsService } from "../../blogs/application/blogs.service";
import { ResultStatus } from "../../common/result/resultCode";
import { UsersQwRepository } from "../../users/infrastructure/user.query.repository";
import { CommentBodyByPost } from "../api/input/post-comments-body";
import { CommentModel } from "../../comments/domain/comment.entity";
import { PostCreateBlogIdDto } from "../../blogs/routers/input/post-blogId-body";
import { UsersRepository } from "../../users/infrastructure/user.repository";
import { LikeStatus } from "../../comments/domain/like.comment.entity";
import { PostLikeModel } from "../domain/like.post.entity";

@injectable()
export class PostsService {
  postsRepo: PostsRepository;
  blogsService: BlogsService;
  usersQwRepo: UsersQwRepository;
  usersRepo: UsersRepository;

  constructor(
    @inject(PostsRepository) postsRepo: PostsRepository,
    @inject(BlogsService) blogsService: BlogsService,
    @inject(UsersQwRepository) usersQwRepo: UsersQwRepository,
    @inject(UsersRepository) usersRepo: UsersRepository,
  ) {
    this.postsRepo = postsRepo;
    this.blogsService = blogsService;
    this.usersQwRepo = usersQwRepo;
    this.usersRepo = usersRepo;
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return this.postsRepo.findById(id);
  }

  async createPost(dto: PostInputModel): Promise<Result<string | null>> {
    const blog = await this.blogsService.findById(dto.blogId);
    if (!blog)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        extensions: [{ field: "blogId", message: "blogId not found" }],
        data: null,
      };

    const post = PostModel.createPost(dto, blog.name);
    await this.postsRepo.savePost(post);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: post._id.toString(),
    };
  }

  async createPostForBlog(
    blogId: string,
    dto: PostCreateBlogIdDto,
  ): Promise<Result<PostDocument | null>> {
    const blog = await this.blogsService.findById(blogId);
    if (!blog)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        extensions: [{ field: "blogId", message: "blogId not found" }],
        data: null,
      };
    const { title, shortDescription, content } = dto;

    const post = PostModel.createPost(
      { title, shortDescription, content, blogId },
      blog.name,
    );

    await this.postsRepo.savePost(post);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: post,
    };
  }

  async updatePost(
    id: string,
    dto: PostInputModel,
  ): Promise<Result<boolean | null>> {
    const post = await this.postsRepo.findById(id);
    if (!post)
      return {
        status: ResultStatus.NotFound,
        errorMessage: "Not Found",
        extensions: [{ field: "post", message: "post not found" }],
        data: null,
      };

    const blog = await this.blogsService.findById(dto.blogId);
    if (!blog)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        extensions: [{ field: "blogId", message: "blogId not found" }],
        data: null,
      };

    try {
      post.updatePost(dto);
      await this.postsRepo.savePost(post);

      return {
        status: ResultStatus.Success,
        extensions: [],
        data: true,
      };
    } catch (e: unknown) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        extensions: [
          {
            field: "post",
            message: e instanceof Error ? e.message : "Unknown error",
          },
        ],
        data: null,
      };
    }
  }

  async deletePost(id: string): Promise<Result<boolean | null>> {
    const post = await this.postsRepo.findById(id);
    if (!post)
      return {
        status: ResultStatus.NotFound,
        errorMessage: "Not Found",
        extensions: [{ field: "post", message: "post not found" }],
        data: null,
      };

    await this.postsRepo.deletePost(id);
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: true,
    };
  }

  async createCommentByPostId(
    postId: string,
    dto: CommentBodyByPost,
    userId: string,
  ): Promise<Result<string | null>> {
    const user = await this.usersRepo.findById(userId);
    if (!user)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        extensions: [{ field: "user", message: "User not found" }],
        data: null,
      };

    const post = await this.postsRepo.findById(postId);
    if (!post)
      return {
        status: ResultStatus.NotFound,
        errorMessage: "Not Found",
        extensions: [{ field: "post", message: "post not found" }],
        data: null,
      };

    const comment = CommentModel.createComment(
      postId,
      userId,
      dto,
      user.accountData.login,
    );

    await this.postsRepo.saveComment(comment);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: comment._id.toString(),
    };
  }

  async updatePostLikeStatus(
    userId: string,
    postId: string,
    likeStatus: LikeStatus,
  ): Promise<Result<boolean | null>> {
    const user = await this.usersRepo.findById(userId);
    if (!user)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        extensions: [{ field: "userId", message: "User unauthorized" }],
        data: null,
      };

    const post = await this.postsRepo.findById(postId);
    if (!post) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: "NotFound",
        extensions: [{ field: "postId", message: "Post not found" }],
        data: null,
      };
    }

    const like = await this.postsRepo.findLikePost(userId, postId);
    if (!like){
    if (likeStatus === LikeStatus.None) {
      return {
        status: ResultStatus.Success,
        extensions: [],
        data: true,
      };
    }
    
      const newLike = PostLikeModel.createLike(userId, postId,  user.accountData.login, likeStatus);
      await this.postsRepo.saveLike(newLike);

      post.countNewLikes(newLike.likeStatus);
      await this.postsRepo.savePost(post);

      return {
        status: ResultStatus.Success,
        extensions: [],
        data: true,
    }
    }

    const oldLike = like.likeStatus;
    const newLike = likeStatus;

    if (newLike === oldLike)
      return {
        status: ResultStatus.Success,
        extensions: [],
        data: true,
      };

    like.likeStatus = newLike;
    post.updateCountLikes(newLike, oldLike);

    await this.postsRepo.saveLike(like);
    await this.postsRepo.savePost(post);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: true,
    };
  }
}
