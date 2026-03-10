import { Post} from "../types/post.type";
import { PostInputModel } from "../dto/post.dto.view.input";
import { WithId } from "mongodb";
import { postsRepository } from "../repositories/post-repositories";
import { PaginationAndSorting } from "../../common/types/pagination_and_sorting";
import { PostSortField } from "../routers/input/post-sort-field";


export const postsService = {

async findMany(queryDto: PaginationAndSorting<PostSortField>): Promise<{items: WithId<Post>[], totalCount: number}> {
return postsRepository.findMany(queryDto);
},


async findManyByBlogId(blogId: string, queryDto: PaginationAndSorting<PostSortField>): Promise<{items: WithId<Post>[], totalCount: number}> {
return postsRepository.findManyBlogId(blogId, queryDto);
},

async findPostById(id: string): Promise<WithId<Post> | null> {
return postsRepository.findPostById(id);
},

async createPost(newPost: Post): Promise<WithId<Post>> {
return postsRepository.createPost(newPost);
},

async updatePost(id: string, dto: PostInputModel): Promise<void> {

     return postsRepository.updatePost(id, dto);
},
  

async deletePost(id: string): Promise<void> {
return postsRepository.deletePost(id);
}
};