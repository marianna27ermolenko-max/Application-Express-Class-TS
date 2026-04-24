import { ObjectId, WithId } from "mongodb"
import { commentsCollection } from "../../db/mongo.db"
import { CommentBodyDto } from "../types/comment.body.dto";
import { ICommentDB } from "../types/comment.db.interface";
import { injectable } from "inversify";

@injectable()
export class CommentsRepository {

 async updateCommentByCommentId(id: string, dto: CommentBodyDto): Promise<boolean>{  //или вернуть айди?
    
    const updateComment = await commentsCollection.updateOne({_id: new ObjectId(id)}, { $set: {'content': dto.content}})
    return updateComment.matchedCount === 1;
}

 async deleteCommentByCommentId(id: string): Promise<boolean>{
 const result = await commentsCollection.deleteOne({_id: new ObjectId(id)});
 return result.deletedCount === 1;
}

 async findCommentById(id: string): Promise <WithId<ICommentDB> | null>{
    const comment = await commentsCollection.findOne({_id: new ObjectId(id)});
    return comment;
}
}

