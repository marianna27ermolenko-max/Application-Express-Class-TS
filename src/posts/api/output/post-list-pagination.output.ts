import { PaginatedOutput } from "../../../common/types/paginated.output";
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