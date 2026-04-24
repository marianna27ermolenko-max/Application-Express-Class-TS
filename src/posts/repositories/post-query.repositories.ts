import { ObjectId, WithId } from "mongodb";
import { commentsCollection, postCollection } from "../../db/mongo.db";
import { Post } from "../types/post.type";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { PostSortField } from "../api/input/post-sort-field";
import { ICommentDB } from "../../comments/types/comment.db.interface";
import { CommentSortField } from "../api/input/comment-sort-field";
import { IPagination } from "../../common/types/pagination";
import { ICommentView } from "../../comments/types/comment.view.model";
import { SortDirections } from "../../common/types/sort-direction";
import { injectable } from "inversify";

@injectable()
export class PostsQwRepository {

   async findMany(
    queryDto: PaginationAndSorting<PostSortField>,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    const items = await postCollection
      .find(filter)

      // "asc" (по возрастанию), то используется 1
      // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({ [sortBy]: sortDirection })

      // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
      .skip(skip)

      // ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter);
    return { items, totalCount };
  }

   async findManyBlogId(
    blogId: string,
    queryDto: PaginationAndSorting<PostSortField>,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (blogId) {
      filter.blogId = blogId;
    }

    const items = await postCollection
      .find(filter)

      // "asc" (по возрастанию), то используется 1
      // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({ [sortBy]: sortDirection })

      // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
      .skip(skip)

      // ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter);
    return { items, totalCount };
  }

   async findPostById(id: string): Promise<WithId<Post> | null> {
    return postCollection.findOne({ _id: new ObjectId(id) });
  }

   async findCommentById(id: string): Promise<ICommentView | null> {
    
  const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
  if(!comment) return null;
  return this._getInViewComment(comment)
  }

   async findManyCommentsByPostId(
    postId: string,
    sortQueryDto: PaginationAndSorting<CommentSortField>,
  ): Promise<IPagination<ICommentView[]>> {
    const { pageNumber, pageSize, sortDirection, sortBy } = sortQueryDto;

    const sortDir = sortDirection === SortDirections.Asc ? 1 : -1;
    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if(postId){
        filter.postId = postId;
    }

    const totalCount = await commentsCollection.countDocuments(filter);

    const comments = await commentsCollection
    .find(filter)
    .sort({ [sortBy]: sortDir })
    .skip(skip)
    .limit(pageSize)
    .toArray();

    return {
    pagesCount: Math.ceil( totalCount / pageSize ),
    page: pageNumber,
    pageSize: pageSize,
    totalCount: totalCount,
    items: comments.map((u) => this._getInViewComment(u)),
    }
  }

   _getInViewComment(comment: WithId<ICommentDB>): ICommentView{
    return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
    },
    createdAt: comment.createdAt.toString(),
 }}
};


