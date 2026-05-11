import { ICommentView } from "../types/comment.view.model";
import { injectable } from "inversify";
import { CommentDocument, CommentModel } from '../../comments/domain/comment.entity'; 
import { LikeModel, LikeStatus } from "../../comments/domain/like.comment.entity";

@injectable()
export class CommentsQrRepository {
  async getCommentById(
    id: string,
    userId?: string,
  ): Promise<ICommentView | null> {
    const comment = await CommentModel.findOne({ _id: id });
    if (!comment) return null;

    //если юзера нет - назн статус нан
    if (!userId) {
      const myStatus = LikeStatus.None;
      return this._getInViewComment(comment, myStatus);
    }

    //а если юзер есть - то гоу в бд - достаем дейст. статус -  присоединяем в комментах - но вдруг если и лайка нет - то что ставим НАН???
    const statusLike = await LikeModel.findOne({ userId, commentId: id }).lean();
    if (!statusLike) {
      const myStatus = LikeStatus.None;
      return this._getInViewComment(comment, myStatus);
    }

    const myStatus = statusLike?.likeStatus;
    return this._getInViewComment(comment, myStatus);
  }

  _getInViewComment(
    comment: CommentDocument,
    myStatus: LikeStatus,
  ): ICommentView {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toString(),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus,
      },
    };
  }
}
