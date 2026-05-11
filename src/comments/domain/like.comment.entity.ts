import mongoose, { Model, HydratedDocument, model } from "mongoose";
import { LIKE_COMMENT_COLLECTION_NAME } from "../../db/mongo.db";

interface ILike {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
  createdAt: string;
}

export enum LikeStatus {
  None = "None",
  Like = "Like",
  Dislike = "Dislike",
}

export class CommantLikeEntity{
  private constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
    public createdAt: string,
  ) {}

 static createLike( userId: string, commentId: string, likeStatus: LikeStatus ){

      const like = new LikeModel({
        userId,
        commentId,
        likeStatus,
        createdAt: new Date().toISOString(),
      });
      

  return like;
 }

 
}

export interface LikeMethods{}
type LikeStatics = typeof CommantLikeEntity;

const LikeSchema = new mongoose.Schema<ILike, LikeModelType, LikeMethods>({
  commentId: { type: String, required: true },
  userId: { type: String, required: true },
  likeStatus: { type: String, enum: Object.values(LikeStatus), required: true },
  createdAt: { type: String, required: true },
});

LikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });

type LikeModelType = Model<ILike, {}, LikeMethods> & LikeStatics;
export type LikeDocument = HydratedDocument<ILike, LikeMethods>;

LikeSchema.loadClass(CommantLikeEntity);

export const LikeModel = model<ILike, LikeModelType>(
  LIKE_COMMENT_COLLECTION_NAME,
  LikeSchema,
);
