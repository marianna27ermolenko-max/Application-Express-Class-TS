import { ObjectId, WithId } from "mongodb";
import { commentsCollection } from "../../db/mongo.db";
import { ICommentDB } from "../types/comment.db.interface";
import { ICommentView } from "../types/comment.view.model";
import { injectable } from "inversify";

@injectable()
export class CommentsQrRepository {

 async getCommentById(id: string): Promise<ICommentView | null>{
const comment = await commentsCollection.findOne({_id: new ObjectId(id)});
if(!comment) return null;
return this._getInViewComment(comment);
}

  _getInViewComment(comment: WithId<ICommentDB>): ICommentView{
    return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
    },
    createdAt: comment.createdAt.toString(),
 }}

}

