import { inject, injectable } from "inversify";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { CommentsQrRepository } from "../infrastructure/comments.query.repository";
import { CommentsRepository } from "../infrastructure/comments.repository";
import { CommentBodyDto } from "../types/comment.body.dto";
import { LikeModel, LikeStatus } from "../domain/like.comment.entity"; 
import { UsersRepository } from "../../users/infrastructure/user.repository";

@injectable()
export class CommentsServer {
  usersRepo: UsersRepository;
  commentsQrRepo: CommentsQrRepository;
  commentsRepo: CommentsRepository;

  constructor(
    @inject(UsersRepository) usersRepo: UsersRepository,
    @inject(CommentsQrRepository) commentsQrRepo: CommentsQrRepository,
    @inject(CommentsRepository) commentsRepo: CommentsRepository,
  ) {
    this.usersRepo = usersRepo;
    this.commentsQrRepo = commentsQrRepo;
    this.commentsRepo = commentsRepo;
  }

  async updateCommentCommentId(
    userId: string,
    commentId: string,
    dto: CommentBodyDto,
  ): Promise<Result<boolean | null>> {
    const user = await this.usersRepo.findById(userId);
    if (!user)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        extensions: [{ field: "userId", message: "User unauthorized" }],
        data: null,
      };

    const comment = await this.commentsRepo.findCommentById(commentId);
    if (!comment)
      return {
        status: ResultStatus.NotFound,
        errorMessage: "NotFound",
        extensions: [{ field: "userId", message: "Comment not found" }],
        data: null,
      };

    if (userId !== comment.commentatorInfo.userId)
      return {
        status: ResultStatus.Forbidden,
        errorMessage: "Forbidden",
        extensions: [
          {
            field: "userId",
            message: "User try delete the comment that is not his own",
          },
        ],
        data: null,
      };
   
    try{
    comment.updateComment(dto); 
    await this.commentsRepo.saveComment(comment)

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: true,
    };
  } catch(e: unknown){
  
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        extensions: [
          {
            field: "Content",
            message: e instanceof Error ? e.message : 'Unknown mistake',
          },
        ],
        data: null,
      };
  }
  }

  async deleteCommentCommentId(
    commentId: string,
    userId: string,
  ): Promise<Result<boolean | null>> {
    const user = await this.usersRepo.findById(userId);
    if (!user)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        extensions: [{ field: "userId", message: "User unauthorized" }],
        data: null,
      };

    const comment = await this.commentsRepo.findCommentById(commentId);
    if (!comment)
      return {
        status: ResultStatus.NotFound,
        errorMessage: "NotFound",
        extensions: [{ field: "commentId", message: "Comment not found" }],
        data: null,
      };

    if (userId !== comment.commentatorInfo.userId)
      return {
        status: ResultStatus.Forbidden,
        errorMessage: "Forbidden",
        extensions: [
          {
            field: "userId",
            message: "User try delete the comment that is not his own",
          },
        ],
        data: null,
      };

    const deleteComment =
      await this.commentsRepo.deleteComment(commentId);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: deleteComment,
    };
  }

  async updateCommentLikeStatus(
    userId: string, commentId: string, likeStatus: LikeStatus ): Promise<Result<boolean | null>>{

    const user = await this.usersRepo.findById(userId);
    if (!user)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        extensions: [{ field: "userId", message: "User unauthorized" }],
        data: null,
      };

    const comment = await this.commentsRepo.findCommentById(commentId);
    if (!comment)
      return {
        status: ResultStatus.NotFound,
        errorMessage: "NotFound",
        extensions: [{ field: "commentId", message: "Comment not found" }],
        data: null,
      };

    //достаем сохраненный статус лайка с бд табл.лайков и потом сравним с тем что нам пришел
    const like = await this.commentsRepo.findLikeComment(userId, commentId);
    if (!like) {
      //если лайка не было и пришел статус нан 
      if (likeStatus === LikeStatus.None) {
        return {
          status: ResultStatus.Success,
          extensions: [],
          data: true,
        };
      }

      //если лайка нет и он не None , тогда создаем лайк - заполняем поля - сохраняем
      const createLike = LikeModel.createLike(userId, commentId, likeStatus) 
      await this.commentsRepo.saveLikeComment(createLike);

      // потом мы должны закинуть этот лайк в табл коммента, а сначала узнаем его статус, чтобы  знать в какое поле добавить +1 (счетчик)
      comment.countNewLikes(createLike.likeStatus);
      await this.commentsRepo.saveComment(comment);

      return {
        status: ResultStatus.Success,
        extensions: [],
        data: true,
      };
    }

    //если лайк есть - смотрим статусы - сравниваем их - если такой же ничего не делаем - если нет - залеьаем в бд комменты и меняем счетчики
    const newLike = likeStatus;
    const oldLike = like.likeStatus;

    //если статусы одинаковые ничего не делаем
    if (newLike === oldLike)
      return {
        status: ResultStatus.Success,
        extensions: [],
        data: true,
      };

    like.likeStatus = newLike;

    //если статусы разные
    comment.updateCountLikes(newLike, oldLike)

    await this.commentsRepo.saveLikeComment(like);
    await this.commentsRepo.saveComment(comment);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: true,
    };
  }
 
}
