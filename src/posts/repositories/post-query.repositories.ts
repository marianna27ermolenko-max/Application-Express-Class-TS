import { PostViewModel } from "../types/post.type";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { PostSortField } from "../api/input/post-sort-field";
import { CommentSortField } from "../api/input/comment-sort-field";
import { IPagination } from "../../common/types/pagination";
import { ICommentView } from "../../comments/types/comment.view.model";
import { SortDirections } from "../../common/types/sort-direction";
import { injectable } from "inversify";
import { PostDocument, PostModel } from '../domain/post.entity'; 
import { CommentDocument, CommentModel } from "../../comments/domain/comment.entity";
import { LikeModel, LikeStatus } from "../../comments/domain/like.comment.entity";
import { UserModel } from "../../users/domain/users.entity";
import { PostLikeModel } from "../domain/like.post.entity";
import { PostListPaginatedOutputSimple } from "../api/output/post-list-pagination.output";


@injectable()
export class PostsQwRepository {

   async findMany(
    queryDto: PaginationAndSorting<PostSortField>, userId?: string,
  ): Promise<PostListPaginatedOutputSimple> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    const posts = await PostModel
      .find(filter)

      // "asc" (по возрастанию), то используется 1
      // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({ [sortBy]: sortDirection })

      // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
      .skip(skip)

      // ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
      
    const totalCount = await PostModel.countDocuments(filter);
    
    const items: PostViewModel[] = await Promise.all(
     posts.map( async (post) => {

      let myStatus = LikeStatus.None;

       if (userId) {
        const like = await PostLikeModel.findOne({
          postId: post._id.toString(),
          userId,
        });

        if (like) {
          myStatus = like.likeStatus;
        }
      }
  
      const newestLikesDb = await PostLikeModel.find({
        postId: post._id.toString(),
        likeStatus: LikeStatus.Like,
      })
        .sort({ createdAt: -1 })
        .limit(3);

          const newestLikes = newestLikesDb.map((l) => ({
          addedAt: l.createdAt,
          userId: l.userId,
          login: l.login,
      }));
  
   return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,

        extendedLikesInfo: {
          likesCount: post.extendedLikesInfo.likesCount,
          dislikesCount: post.extendedLikesInfo.dislikesCount,
          myStatus,
          newestLikes,
        },
      };
    }),
  );

  return this._mapToPostListPaginatedOutput(
  {
    pageNumber,
    pageSize,
    totalCount,
  },
  items,
);
}
 
   async findManyBlogId(
    blogId: string,
    queryDto: PaginationAndSorting<PostSortField>,
    userId?: string,
  ): Promise<PostListPaginatedOutputSimple> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (blogId) {
      filter.blogId = blogId;
    }

    const posts = await PostModel
      .find(filter)

      // "asc" (по возрастанию), то используется 1
      // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({ [sortBy]: sortDirection })
      // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
      .skip(skip)
      // ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
  

    const totalCount = await PostModel.countDocuments(filter);

     const items: PostViewModel[] = await Promise.all(
         posts.map(async (post) => {

      let myStatus = LikeStatus.None;

      if (userId) {
        const like = await PostLikeModel.findOne({
          postId: post._id.toString(),
          userId,
        });

        if (like) {
          myStatus = like.likeStatus;
        }
      }

      const newestLikesDb = await PostLikeModel.find({
        postId: post._id.toString(),
        likeStatus: LikeStatus.Like,
      })
        .sort({ createdAt: -1 })
        .limit(3);

      const newestLikes = newestLikesDb.map((l) => ({
        addedAt: l.createdAt,
        userId: l.userId,
        login: l.login,
      }));

      return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,

        extendedLikesInfo: {
          likesCount: post.extendedLikesInfo.likesCount,
          dislikesCount: post.extendedLikesInfo.dislikesCount,
          myStatus,
          newestLikes,
        },
      };
    }),
  );

  return this._mapToPostListPaginatedOutput(
    {
      pageNumber,
      pageSize,
      totalCount,
    },
    items,
  );
    
  }

   async findPostById(postId: string, userId?: string): Promise<PostViewModel | null> {
   
   const post = await PostModel.findOne({_id: postId});
   if(!post) return null;

   const user = await UserModel.findById(userId);
   let myStatus;

   if(!user){ myStatus = LikeStatus.None; 
  } else {
    const like = await PostLikeModel.findOne({postId, userId});

    if(!like){myStatus = LikeStatus.None} else {
    myStatus = like?.likeStatus }
  };

  const lastLike = await PostLikeModel.find({postId, likeStatus: LikeStatus.Like}).sort({createdAt: SortDirections.Desc}).limit(3);

   const newestLikes = lastLike.map((l) => ({
    addedAt: l.createdAt,
    userId: l.userId,
    login: l.login,
  }))

   return this._mapToPostViewModel(post, myStatus, newestLikes); 
  }

  async findCommentById(id: string): Promise<ICommentView | null> {
    
  const comment = await CommentModel.findOne({_id: id});
  if(!comment) return null;

  const myStatus = LikeStatus.None; //переделать под общую
  return this._getInViewComment(comment, myStatus) // - переделать на приват  
  }

   async findManyCommentsByPostId(
    postId: string,
    sortQueryDto: PaginationAndSorting<CommentSortField>,
    userId?: string,
  ): Promise<IPagination<ICommentView[]>> {
    const { pageNumber, pageSize, sortDirection, sortBy } = sortQueryDto;

    const sortDir = sortDirection === SortDirections.Asc ? 1 : -1;
    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if(postId){
        filter.postId = postId;
    }

    const totalCount = await CommentModel.countDocuments(filter);

    const comments = await CommentModel
    .find(filter)
    .sort({ [sortBy]: sortDir })
    .skip(skip)
    .limit(pageSize)

    // если нет userId - всем нан
  if (!userId) {
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: comments.map(c =>
        this._getInViewComment(c, LikeStatus.None)
      ),
    };
  }
   
    // получаем лайки пользователя для этих комментариев
    const commentIds = comments.map(c => c._id.toString());
    const likes = await LikeModel.find({userId, commentId: { $in: commentIds }})
   
    return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize: pageSize,
    totalCount: totalCount,
    items: comments.map(comment => {

      const foundLike = likes.find(
        l => l.commentId === comment._id.toString()
      );

      const myStatus = foundLike
        ? foundLike.likeStatus
        : LikeStatus.None;

      return this._getInViewComment(comment, myStatus);
    }),
  }}

   _getInViewComment(comment: CommentDocument, myStatus: LikeStatus): ICommentView{
    return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin 
    },
    createdAt: comment.createdAt.toString(),
    likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus,
      },
 }}
 

 _mapToPostViewModel(post: PostDocument, myStatus: LikeStatus, newestLikes:{ addedAt: string; userId: string; login: string;}[]): PostViewModel {
 
   return { 
 
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus,
      newestLikes,
    } 
 }
};

_mapToPostListPaginatedOutput(meta: {
  pageNumber: number,
  pageSize: number,
  totalCount: number,
}, 
items: PostViewModel[]): PostListPaginatedOutputSimple {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items,
    }
  };

}

