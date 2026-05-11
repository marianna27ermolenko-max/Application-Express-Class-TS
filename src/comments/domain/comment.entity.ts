import mongoose, { HydratedDocument, model, Model } from "mongoose";
import { COMMENTS_COLLECTION_NAME } from "../../db/mongo.db";
import { CommentBodyDto } from "../types/comment.body.dto";
import { LikeStatus } from "./like.comment.entity";
import { CommentBodyByPost } from "../../posts/api/input/post-comments-body";

export interface IComment{
  content: string;
  postId: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
}

export interface LikesInfo {
  likesCount: number;
  dislikesCount: number;
}

export interface CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class CommentEntity {
  private constructor(
    public content: string,
    public postId: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public likesInfo: LikesInfo,
  ){}

  static createComment(postId: string, userId: string, dto: CommentBodyByPost, userLogin: string){
   const comment = new CommentModel({
     content: dto.content,
     postId,
     commentatorInfo:{
      userId,
      userLogin,
    },
     createdAt: new Date().toISOString(),
     likesInfo: {
      likesCount: 0, 
      dislikesCount: 0},
   })

   return comment;
  }

  updateComment(this: CommentDocument, dto: CommentBodyDto){
    if (!dto.content.trim()) { throw new Error('Invalid content')}
    this.content = dto.content; 
  }

  addLike(this: CommentDocument){
     this.likesInfo.likesCount += 1;
  }

  addDislike(this: CommentDocument){
   this.likesInfo.dislikesCount += 1;
  }

  removeDislike(this: CommentDocument){
  this.likesInfo.dislikesCount = Math.max(0, this.likesInfo.dislikesCount - 1);
  }

  removeLike(this: CommentDocument){
  this.likesInfo.likesCount = Math.max(0, this.likesInfo.likesCount - 1);
  }

  countNewLikes(this: CommentDocument, likeStatus: LikeStatus){

   if(likeStatus === LikeStatus.Like) {
     this.addLike();
   } else if (likeStatus === LikeStatus.Dislike) {
        this.addDislike();
      }
  }

  updateCountLikes(this: CommentDocument, newLike: LikeStatus, oldLike: LikeStatus){

 if (newLike === LikeStatus.Like && oldLike === LikeStatus.Dislike) {
      this.addLike();
      this.removeDislike();
    } else if (newLike === LikeStatus.Dislike && oldLike === LikeStatus.Like) {   
      this.removeLike();
      this.addDislike();

    } else if (newLike === LikeStatus.None && oldLike === LikeStatus.Like) {    
      this.removeLike();

    } else if (newLike === LikeStatus.None && oldLike === LikeStatus.Dislike) { 
      this.removeDislike();
    }
  }


}

export interface CommentMethods{
 updateComment( dto: CommentBodyDto ): void;
 addLike(this: CommentDocument): void;
 addDislike(this: CommentDocument): void;
 removeDislike(this: CommentDocument): void;
 removeLike(this: CommentDocument): void;
 countNewLikes(this: CommentDocument, likeStatus: LikeStatus): void;
 updateCountLikes(this: CommentDocument, newLike: LikeStatus, oldLike: LikeStatus): void;
}

type CommentStatics = typeof CommentEntity;

const LikeInfoSchema = new mongoose.Schema<LikesInfo>({
  likesCount: { type: Number, required: true },
  dislikesCount: { type: Number, required: true },
});

const CommentatorSchema = new mongoose.Schema<CommentatorInfo>({
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
});

type CommentModelType = Model<IComment, {}, CommentMethods> & CommentStatics;
export type CommentDocument = HydratedDocument<IComment, CommentMethods>;

//ОСНОВНАЯ СХЕМА
const CommentSchema = new mongoose.Schema<IComment,CommentModelType, CommentMethods>({
  content: { type: String, required: true },
  postId: { type: String, required: true },
  commentatorInfo: { type: CommentatorSchema, required: true },
  createdAt: { type: String, required: true },
  likesInfo: {
    type: LikeInfoSchema,
    required: true,
    default: { likesCount: 0, dislikesCount: 0 },
  },
});

CommentSchema.loadClass(CommentEntity);

export const CommentModel = model<IComment, CommentModelType>(
  COMMENTS_COLLECTION_NAME,
  CommentSchema,
);
