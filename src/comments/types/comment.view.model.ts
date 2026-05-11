import { CommentatorInfo, LikesInfo } from '../../comments/domain/comment.entity'; 
import { LikeStatus } from "../../comments/domain/like.comment.entity";

type MyStatusType = {
    myStatus: LikeStatus
}
export interface ICommentView{
    
    id: string;
    content: string;
    commentatorInfo: CommentatorInfo;
    createdAt: string;
    likesInfo: LikesInfo & MyStatusType; 

}