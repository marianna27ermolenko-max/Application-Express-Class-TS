import mongoose, { HydratedDocument, model, Model } from "mongoose";
import { POSTS_COLLECTION_NAME } from "../../db/mongo.db";
import { PostInputModel } from "../dto/post.dto.view.input";
import { LikeStatus } from "../../comments/domain/like.comment.entity";


 export interface PostLikesInfo {
  likesCount: number;
  dislikesCount: number;
}

export interface Post {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: PostLikesInfo;
}

export class PostEntity{
  private constructor(
  public title: string,
  public shortDescription: string,
  public content: string,
  public blogId: string,
  public blogName: string,
  public createdAt: string,
  public extendedLikesInfo: PostLikesInfo,
  ){}

  static createPost(dto: PostInputModel, blogName: string){
  const post = new PostModel({
  title: dto.title,
  shortDescription: dto.shortDescription,
  content: dto.content,
  blogId: dto.blogId,
  blogName,
  createdAt: new Date().toISOString(),
  extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
    }
  });
  
  return post;
  } 

  updatePost(this: PostDocument, dto: PostInputModel){ 
     if(!dto.title || !dto.shortDescription || !dto.content || !dto.blogId){
      throw new Error ('Invalid post data')
     }

     this.title = dto.title;
     this.shortDescription = dto.shortDescription;
     this.content = dto.content;
     this.blogId = dto.blogId;
  }

  addLike(this: PostDocument){
       this.extendedLikesInfo.likesCount += 1;
    }
  
    addDislike(this: PostDocument){
     this.extendedLikesInfo.dislikesCount += 1;
    }
  
    removeDislike(this: PostDocument){
    this.extendedLikesInfo.dislikesCount = Math.max(0, this.extendedLikesInfo.dislikesCount - 1);
    }
  
    removeLike(this: PostDocument){
    this.extendedLikesInfo.likesCount = Math.max(0, this.extendedLikesInfo.likesCount - 1);
    }
  
    countNewLikes(this: PostDocument, likeStatus: LikeStatus){
  
     if(likeStatus === LikeStatus.Like) {
       this.addLike();
     } else if (likeStatus === LikeStatus.Dislike) {
          this.addDislike();
        }
    }
  
    updateCountLikes(this: PostDocument, newLike: LikeStatus, oldLike: LikeStatus){
  
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

export interface PostMethods{
updatePost(dto: PostInputModel): void;
 addLike(this: PostDocument): void;
 addDislike(this: PostDocument): void;
 removeDislike(this: PostDocument): void;
 removeLike(this: PostDocument): void;
 countNewLikes(this: PostDocument, likeStatus: LikeStatus): void;
 updateCountLikes(this: PostDocument, newLike: LikeStatus, oldLike: LikeStatus): void;
}

type PostStatics = typeof PostEntity;

const LikeInfoSchema = new mongoose.Schema<PostLikesInfo>({
  likesCount: { type: Number, required: true },
  dislikesCount: { type: Number, required: true },
});

export const PostSchema = new mongoose.Schema<Post, PostModelType, PostMethods>({
    title: { type: String, required: true, },                    
    shortDescription: { type: String, required: true, },         
    content: { type: String, required: true, maxLength: 300 },
    blogId: { type: String, required: true, },
    blogName: { type: String, required: true, },
    createdAt: { type: String, required: true, },
    extendedLikesInfo: { type: LikeInfoSchema, required: true, default: { likesCount: 0, dislikesCount: 0 }},
})

type PostModelType = Model<Post, {}, PostMethods> & PostStatics;
export type PostDocument = HydratedDocument<Post, PostMethods>;

PostSchema.loadClass(PostEntity);

export const PostModel = model<Post, PostModelType>(POSTS_COLLECTION_NAME, PostSchema);

