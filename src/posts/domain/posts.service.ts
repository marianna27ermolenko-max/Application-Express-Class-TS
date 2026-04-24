import { Post} from "../types/post.type";
import { PostInputModel } from "../dto/post.dto.view.input";
import { WithId } from "mongodb";
import { PostsRepository } from "../repositories/post-repositories";
import { ICommentDB } from "../../comments/types/comment.db.interface";
import { inject, injectable } from "inversify";

@injectable()
export class PostsService {

postsRepo: PostsRepository;

constructor(@inject(PostsRepository) postsRepo: PostsRepository){

this.postsRepo = postsRepo;

}    

 async findPostById(id: string): Promise<WithId<Post> | null> {  
return this.postsRepo.findPostById(id);
}

 async createPost(newPost: Post): Promise<WithId<Post>> {
return this.postsRepo.createPost(newPost);
}

 async updatePost(id: string, dto: PostInputModel): Promise<void> {
return this.postsRepo.updatePost(id, dto);
}
  
 async deletePost(id: string): Promise<void> {
return this.postsRepo.deletePost(id);
}

 async createCommentByPostId(newComment: ICommentDB): Promise<string>{
const createComment = await this.postsRepo.createCommentByPostId(newComment);
return createComment;
}

};

