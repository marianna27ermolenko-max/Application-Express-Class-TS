import { Response } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { RequestWithParams, RequestWithParamsAndBody } from "../../../common/types/requests";
import { CommentIdType, IdType  } from "../../../common/types/id";
import { CommentsServer } from "../../domain/comments.service";
import { CommentBodyDto } from "../../types/comment.body.dto";
import { ResultStatus } from "../../../common/result/resultCode";
import { CommentsQrRepository } from "../../infrastructure/comments.query.repository";
import { inject, injectable } from "inversify";

@injectable()
export class CommentsController{

    commentsServer: CommentsServer;
    commentsQrRepo: CommentsQrRepository;

    constructor(@inject(CommentsServer) commentsServer: CommentsServer, @inject(CommentsQrRepository) commentsQrRepo: CommentsQrRepository){
        this.commentsServer = commentsServer;
          this.commentsQrRepo = commentsQrRepo;
    }

    async  deleteCommentHandler(
      req: RequestWithParams<CommentIdType>,
      res: Response,
    ){
      try {    
    
        const userId = req.userId!;
        const commentId = req.params.commentId;

        const deleteComment = await  this.commentsServer.deleteCommentCommentId(commentId, userId);

        if(deleteComment.status === ResultStatus.Unauthorized){return res.sendStatus(HttpStatus.UNAUTHORIZED)}
        if(deleteComment.status === ResultStatus.BadRequest){return res.sendStatus(HttpStatus.BAD_REQUEST)}
        if(deleteComment.status === ResultStatus.Forbidden){return res.sendStatus(HttpStatus.FORBIDDEN)}
        if(deleteComment.status === ResultStatus.Success){return  res.sendStatus(HttpStatus.NO_CONTENT)}


    //     const user = await CommentsServer.getUserByUserId(userId);
    //     if(!user) return res.sendStatus(HttpStatus.UNAUTHORIZED);
    
    //    const comment = await CommentsServer.getCommentById(commentId);
    //    if(!comment) return res.sendStatus(HttpStatus.NOT_FOUND);
    
    //    if(userId !== comment.commentatorInfo.userId) return res.sendStatus(HttpStatus.FORBIDDEN);
    
    //     const deleteComment = await CommentsServer.deleteCommentCommentId(commentId, userId);
    //     if(!deleteComment){
    //     return res.sendStatus(HttpStatus.NOT_FOUND);
    //     }
    
        // res.sendStatus(HttpStatus.NO_CONTENT);
    
      } catch (e: unknown) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    async getCommentHandler(
      req: RequestWithParams<IdType>,
      res: Response,
    ){
      try {
      
        const comment = await this.commentsQrRepo.getCommentById(req.params.id);
        if(!comment){return res.sendStatus(HttpStatus.NOT_FOUND)}
    
        res.status(HttpStatus.OK).json(comment);
    
      } catch (e: unknown) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    async  updateCommentHandler(
      req: RequestWithParamsAndBody<{commentId:string}, CommentBodyDto>,
      res: Response,
    ) {
      try {
      
       const userId = req.userId!;
       const commentId = req.params.commentId;
    
       const updateComment =  await  this.commentsServer.updateCommentCommentId(userId, commentId, req.body);
       if(updateComment.status === ResultStatus.Unauthorized){return res.sendStatus(HttpStatus.UNAUTHORIZED)}
       if(updateComment.status === ResultStatus.NotFound){return res.sendStatus(HttpStatus.NOT_FOUND)}
       if(updateComment.status === ResultStatus.Forbidden){return res.sendStatus(HttpStatus.FORBIDDEN)}
       if(updateComment.status === ResultStatus.Success){return res.sendStatus(HttpStatus.NO_CONTENT)}



    //    const user = await CommentsServer.getUserByUserId(userId); 
    //    if(!user) return res.sendStatus(HttpStatus.NOT_FOUND);
    
    //    const comment = await CommentsServer.getCommentById(commentId);
    //    if(!comment) return res.sendStatus(HttpStatus.NOT_FOUND);
    
    //    if(userId !== comment.commentatorInfo.userId) return res.sendStatus(HttpStatus.FORBIDDEN);
    
    //    const updateComment =  await CommentsServer.updateCommentCommentId(commentId, req.body);
    //    if(!updateComment){ return res.sendStatus(HttpStatus.BAD_REQUEST)}
    
    //    res.sendStatus(HttpStatus.NO_CONTENT);
    
      } catch (e: unknown) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }  
}
