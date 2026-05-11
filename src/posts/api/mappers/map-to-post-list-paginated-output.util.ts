import { PostListPaginatedOutputSimple } from "../output/post-list-pagination.output";
import { PostDocument } from '../../domain/post.entity'; 

export function mapToPostListPaginatedOutput(posts: PostDocument[], meta: {
  pageNumber: number;
  pageSize: number; 
  totalCount: number;
}): PostListPaginatedOutputSimple {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt
    }))
  };
}


//для тех где нет айди - для всех
export function mapToALLPostListPaginatedOutput(posts: PostDocument[], meta: {
  pageNumber: number;
  pageSize: number; 
  totalCount: number;
}): PostListPaginatedOutputSimple {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt
    }))
  };
}