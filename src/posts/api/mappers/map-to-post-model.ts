import { WithId } from "mongodb";
import { Post, PostViewModel } from "../../types/post.type";

export function mapToPostViewMolel(post: WithId<Post>): PostViewModel {

  return new PostViewModel( 

   post._id.toString(),
   post.title,
   post.shortDescription,
   post.content,
   post.blogId,
   post.blogName,
   post.createdAt,

    )
}