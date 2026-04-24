import { commentsCollection, postCollection } from "../../db/mongo.db";
import { Post} from "../types/post.type";
import { PostInputModel } from "../dto/post.dto.view.input";
import { WithId, ObjectId } from "mongodb";
import { ICommentDB } from "../../comments/types/comment.db.interface";
import { injectable } from "inversify";

@injectable()
export class PostsRepository {

 async findPostById(id: string): Promise<WithId<Post> | null> {
return postCollection.findOne({_id: new ObjectId(id)});
}

 async createPost(newPost: Post): Promise<WithId<Post>> {
const insertResult = await postCollection.insertOne(newPost);
return {...newPost, _id: insertResult.insertedId}
}

 async createCommentByPostId(newComment: ICommentDB): Promise<string> { //переместить всервис - оттуда репа комментс
const insertResult = await commentsCollection.insertOne(newComment);
return insertResult.insertedId.toString();
}

 async updatePost(id: string, dto: PostInputModel): Promise<void> {

    const updateResult = await postCollection.updateMany({_id: new ObjectId(id)},
    {$set: {    
    title: dto.title, 
    shortDescription: dto.shortDescription, 
    content: dto.content,
    blogId: dto.blogId,
}})
    if(updateResult.matchedCount < 1 ){
        throw new Error('Post not exist')
    };
    return;
}

 async updateManyBlogNameByBlogId(blogId: string, newblogName: string): Promise<void>{
await postCollection.updateMany(
    {blogId: blogId},
    {$set: { blogName: newblogName }}
);
return;
}

 async deletePost(id: string): Promise<void> {
const deleteResult = await postCollection.deleteOne({_id: new ObjectId(id)});
if(deleteResult.deletedCount < 1){ throw new Error('Post not exist') };
return;
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