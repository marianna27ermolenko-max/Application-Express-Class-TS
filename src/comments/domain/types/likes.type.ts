import { LikeStatus } from "../like.comment.entity";

export type LikeInputModel = {   
  likeStatus: LikeStatus;
};

export type LikesInfoViewModel = {  
  likesCount: number;
  dislikesCount: number;
};