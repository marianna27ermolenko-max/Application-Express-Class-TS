import { LikeStatus } from "../../comments/domain/like.comment.entity";
import { PostLikesInfo } from "../domain/post.entity";

type MyStatusType = {
  myStatus: LikeStatus;
};

export type NewestLikes = {
  newestLikes: {
    addedAt: string;
    userId: string;
    login: string;
  }[];
};
export interface PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: PostLikesInfo & MyStatusType & NewestLikes;
}
