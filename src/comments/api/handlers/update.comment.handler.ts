// import { Response } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { RequestWithParamsAndBody } from "../../../common/types/requests";
// import { CommentBodyDto } from "../../types/comment.body.dto";
// import { CommentsServer } from "../../domain/comments.service";

// export async function updateCommentHandler(
//   req: RequestWithParamsAndBody<{commentId:string}, CommentBodyDto>,
//   res: Response,
// ) {
//   try {
  
//    const userId = req.userId!;
//    const commentId = req.params.commentId;

//    const user = await CommentsServer.getUserByUserId(userId); //УДалить!!! - либо перенести проверку в мидлваре токена
//    if(!user) return res.sendStatus(HttpStatus.NOT_FOUND);

//    const comment = await CommentsServer.getCommentById(commentId);
//    if(!comment) return res.sendStatus(HttpStatus.NOT_FOUND);

//    if(userId !== comment.commentatorInfo.userId) return res.sendStatus(HttpStatus.FORBIDDEN);

//   //  const checkUserIdWithComment = await commentsServer.checkUserIdWithComment(userId, commentId);
//   //  if(!checkUserIdWithComment){ return res.sendStatus(HttpStatus.FORBIDDEN)};

//    const updateComment =  await CommentsServer.updateCommentCommentId(commentId, req.body); // !!!!!перенести все вызовы в сервис в этот метод - мы будет их делать внутри
//    if(!updateComment){ return res.sendStatus(HttpStatus.BAD_REQUEST)}

//    res.sendStatus(HttpStatus.NO_CONTENT);

//   } catch (e: unknown) {
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }
