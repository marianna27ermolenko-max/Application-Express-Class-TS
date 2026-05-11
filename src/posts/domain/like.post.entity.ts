import mongoose, { HydratedDocument, model, Model } from "mongoose";
import { LikeStatus } from "../../comments/domain/like.comment.entity";
import { LIKE_POST_COLLECTION_NAME } from "../../db/mongo.db";

interface ILikePost {
  postId: string;
  userId: string;
  login: string;
  likeStatus: LikeStatus;
  createdAt: string;
}

export class PostLikeEntity{
  private constructor(
    public postId: string,
    public userId: string,
    public login: string,
    public likeStatus: LikeStatus,
    public createdAt: string,
  ) {}

 static createLike( userId: string, postId: string, login: string, likeStatus: LikeStatus ){

      const like = new PostLikeModel({
        postId,
        userId,
        login,
        likeStatus,
        createdAt: new Date().toISOString(),
      });
      

  return like;
 }
}


export interface PostLikeMethods{}
type PostLikeStatics = typeof PostLikeEntity;

const LikeSchema = new mongoose.Schema<ILikePost, PostLikeModelType, PostLikeMethods>({
  postId: { type: String, required: true },
  userId: { type: String, required: true },
  login: { type: String, required: true },
  likeStatus: { type: String, enum: Object.values(LikeStatus), required: true },
  createdAt: { type: String, required: true },
});

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

type PostLikeModelType = Model<ILikePost, {}, PostLikeMethods> & PostLikeStatics;
export type PostLikeDocument = HydratedDocument<ILikePost, PostLikeMethods>;

LikeSchema.loadClass(PostLikeEntity);

export const PostLikeModel = model<ILikePost, PostLikeModelType>(
  LIKE_POST_COLLECTION_NAME,
  LikeSchema,
);
