import { inject, injectable } from "inversify";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";
import { UsersQwRepository } from "../../users/infrastructure/user.query.repository";
import { CommentsQrRepository } from "../infrastructure/comments.query.repository";
import { CommentsRepository } from "../infrastructure/comments.repository";
import { CommentBodyDto } from "../types/comment.body.dto";
import { ICommentView } from "../types/comment.view.model";

@injectable()
export class CommentsServer {

 usersQwRepo: UsersQwRepository;
 commentsQrRepo:  CommentsQrRepository;
 commentsRepo: CommentsRepository; 


 constructor(@inject(UsersQwRepository) usersQwRepo: UsersQwRepository, @inject(CommentsQrRepository) commentsQrRepo:  CommentsQrRepository, @inject(CommentsRepository) commentsRepo: CommentsRepository){
  this.usersQwRepo = usersQwRepo;
   this.commentsQrRepo = commentsQrRepo;
   this.commentsRepo = commentsRepo;

 } 

 async updateCommentCommentId(userId: string, commentId: string, dto: CommentBodyDto): Promise<Result<boolean | null>>{ 

const user = await this.usersQwRepo.findUserByUserId(userId);
if(!user) return {
  status: ResultStatus.Unauthorized,
  errorMessage: 'Unauthorized',
  extensions: [{field: 'userId', message: 'User unauthorized'}],
  data: null }
  
const comment = await this.commentsRepo.findCommentById(commentId);
if(!comment) return {
  status: ResultStatus.NotFound,
  errorMessage: 'NotFound',
  extensions: [{field: 'userId', message: 'Comment not found'}],
  data: null }  

if(userId !== comment.commentatorInfo.userId)
  return {
  status: ResultStatus.Forbidden,
  errorMessage: 'Forbidden',
  extensions: [{field: 'userId', message: 'User try delete the comment that is not his own'}],
  data: null }

const updateComment = await this.commentsRepo.updateCommentByCommentId(commentId, dto);
return {
  status: ResultStatus.Success,
  extensions: [],
  data: updateComment
}
}  
    
 async deleteCommentCommentId(commentId: string, userId: string): Promise<Result<boolean | null>>{ 

const user = await this.usersQwRepo.findUserByUserId(userId);
if(!user) return {
  status: ResultStatus.Unauthorized,
  errorMessage: 'Unauthorized',
  extensions: [{field: 'userId', message: 'User unauthorized'}],
  data: null }

const comment = await  this.commentsQrRepo.getCommentById(commentId);
if(!comment) return {
  status: ResultStatus.NotFound,
  errorMessage: 'NotFound',
  extensions: [{field: 'userId', message: 'Comment not found'}],
  data: null }

if(userId !== comment.commentatorInfo.userId)
  return {
  status: ResultStatus.Forbidden,
  errorMessage: 'Forbidden',
  extensions: [{field: 'userId', message: 'User try delete the comment that is not his own'}],
  data: null }

const deleteComment =  await this.commentsRepo.deleteCommentByCommentId(commentId);

return{
  status: ResultStatus.Success,
  extensions: [],
  data: deleteComment
}
}  

//ПОСМОТРЕТЬ ЭТИ МЕТОДЫ МОЖЕТ ОНИ И НЕ НАДО 
 async getUserByUserId(userId: string): Promise<boolean>{
    const user = await this.usersQwRepo.findUserByUserId(userId);
    if(!user) return false;
    return true;
 }

 async getCommentById(id: string): Promise<ICommentView | null>{
  const comment = await  this.commentsQrRepo.getCommentById(id);
  if(!comment) return null;
  return comment;
}

}


