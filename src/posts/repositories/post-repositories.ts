import { Post, PostDocument, PostModel } from '../domain/post.entity'; ; 
import { injectable } from "inversify";
import { CommentDocument } from '../../comments/domain/comment.entity'; 
import { LikeModel } from '../../comments/domain/like.comment.entity';
import { PostLikeDocument, PostLikeModel } from '../domain/like.post.entity';


@injectable()
export class PostsRepository {

async savePost(post: PostDocument): Promise<void> {
await post.save()
}   

async saveLike(like: PostLikeDocument): Promise<void> {
await like.save()
}  

async saveComment(newComment: CommentDocument): Promise<CommentDocument>{ 
const comment = await newComment.save();
return comment;
 }

async findById(id: string): Promise<PostDocument | null> {
return PostModel.findOne({_id: id});
}

async updateManyBlogNameByBlogId(blogId: string, newblogName: string): Promise<void>{
await PostModel.updateMany(
    {blogId: blogId},
    {$set: { blogName: newblogName }}
);
return;
}

 async deletePost(id: string): Promise<boolean> {
const deleteResult = await PostModel.deleteOne({_id: id});
return deleteResult.deletedCount === 1;
}

 async findLikePost(userId: string, postId: string): Promise<PostLikeDocument | null> {
  const like = await PostLikeModel.findOne({userId, postId});
  if(!like) return null;
  return like;
 }

};








//совсем старый код
// async findMany(queryDto: PaginationAndSorting<PostSortField>): Promise<{items: WithId<Post>[], totalCount: number}> {

// const {
//     pageNumber,
//     pageSize,
//     sortBy,
//     sortDirection,
// } = queryDto;

// const skip = (pageNumber - 1) * pageSize;
// const filter: any = {};

// const items = await postCollection
//       .find(filter)
 
//       // "asc" (по возрастанию), то используется 1
//       // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
//       .sort({[sortBy]: sortDirection})
 
//       // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
//       .skip(skip)
 
//       // ограничивает количество возвращаемых документов до значения pageSize
//       .limit(pageSize)
//       .toArray();

//       const totalCount = await postCollection.countDocuments(filter)

// return  {items, totalCount };
// },


// async findManyBlogId(blogId: string, queryDto: PaginationAndSorting<PostSortField>): Promise<{items: WithId<Post>[], totalCount: number}> {

// const {
//     pageNumber,
//     pageSize,
//     sortBy,
//     sortDirection,
// } = queryDto;

// const skip = (pageNumber - 1) * pageSize;
// const filter: any = {};

// if(blogId){
//     filter.blogId = blogId;
// }

// const items = await postCollection
//       .find(filter)
 
//       // "asc" (по возрастанию), то используется 1
//       // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
//       .sort({[sortBy]: sortDirection})
 
//       // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
//       .skip(skip)
 
//       // ограничивает количество возвращаемых документов до значения pageSize
//       .limit(pageSize)
//       .toArray();

//       const totalCount = await postCollection.countDocuments(filter)

// return  {items, totalCount };
// },