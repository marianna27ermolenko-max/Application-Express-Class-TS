import { PostViewModel } from "../../types/post.type";
import { PostDocument } from "../../domain/post.entity"; 
import { LikeStatus } from "../../../comments/domain/like.comment.entity";

export function mapToPostViewMolel(post: PostDocument)/* : PostViewModel */ {

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
      myStatus: LikeStatus.None,
      newestLikes: [],
  }
}
}