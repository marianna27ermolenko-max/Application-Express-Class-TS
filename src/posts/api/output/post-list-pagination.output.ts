import { LikeStatus } from "../../../comments/domain/like.comment.entity";
import { PaginatedOutput } from "../../../common/types/paginated.output";
import { NewestLikes } from "../../types/post.type";
import { PostDataOutput } from "./post-data-output";


export type PostListPaginatedOutput = {

    meta: PaginatedOutput;
    items: PostDataOutput[];
}

export type PostListPaginatedOutputSimple = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<{
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
  }>;
};

export type PostListPaginated = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<{
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: {
      likesCount: number,
      dislikesCount: number,
      myStatus: LikeStatus,
      newestLikes: NewestLikes,
    }
  }>;
};