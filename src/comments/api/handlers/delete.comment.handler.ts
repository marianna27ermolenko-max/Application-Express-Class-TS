// import { Response } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { RequestWithParams } from "../../../common/types/requests";
// import { CommentIdType  } from "../../../common/types/id";
// import { CommentsServer } from "../../domain/comments.service";

// export async function deleteCommentHandler(
//   req: RequestWithParams<CommentIdType>,
//   res: Response,
// ){
//   try {    

//     const userId = req.userId!;
//     const commentId = req.params.commentId;
    
//     const user = await CommentsServer.getUserByUserId(userId);
//     if(!user) return res.sendStatus(HttpStatus.UNAUTHORIZED);

//    const comment = await CommentsServer.getCommentById(commentId);
//    if(!comment) return res.sendStatus(HttpStatus.NOT_FOUND);

//    if(userId !== comment.commentatorInfo.userId) return res.sendStatus(HttpStatus.FORBIDDEN);

//     // const checkUserIdWithComment = await commentsServer.checkUserIdWithComment(userId, commentId);
//     // if(!checkUserIdWithComment){ return res.sendStatus(HttpStatus.FORBIDDEN)};

//     const deleteComment = await CommentsServer.deleteCommentCommentId(commentId);
//     if(!deleteComment){
//     return res.sendStatus(HttpStatus.NOT_FOUND);
//     }

//     res.sendStatus(HttpStatus.NO_CONTENT);

//   } catch (e: unknown) {
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }
