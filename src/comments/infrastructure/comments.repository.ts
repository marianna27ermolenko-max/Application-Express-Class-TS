import { injectable } from "inversify";
import { CommentDocument, CommentModel } from '../../comments/domain/comment.entity'; 
import { LikeDocument, LikeModel } from "../../comments/domain/like.comment.entity";

@injectable()
export class CommentsRepository {

async saveComment(comment: CommentDocument): Promise<void>{ 
await comment.save();
}   

 async deleteComment(id: string): Promise<boolean>{
 const result = await CommentModel.deleteOne({_id: id});
 return result.deletedCount === 1;
}

 async findCommentById(id: string): Promise <CommentDocument | null>{
    const comment = await CommentModel.findById(id);
    return comment;
}

//LIKE METHOD
async findLikeComment(userId: string, commentId: string,): Promise <LikeDocument | null>{
const result = await LikeModel.findOne({userId, commentId});
if(!result) return null;
return result;
}

async saveLikeComment(like: LikeDocument): Promise<void>{
await like.save()
}


}

