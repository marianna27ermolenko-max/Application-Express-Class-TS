// import { Response } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { RequestWithParams } from "../../../common/types/requests";
// import { IdType } from "../../../common/types/id";
// import { CommentsQrRepository } from "../../infrastructure/comments.query.repository";

// export async function getCommentHandler(
//   req: RequestWithParams<IdType>,
//   res: Response,
// ){
//   try {
  
//     const comment = await CommentsQrRepository.getCommentById(req.params.id);
//     if(!comment){return res.sendStatus(HttpStatus.NOT_FOUND)}

//     res.status(HttpStatus.OK).json(comment);

//   } catch (e: unknown) {
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }
