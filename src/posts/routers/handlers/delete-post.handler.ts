import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { postsService } from "../../domain/posts.service";

export async function deletePostHandler(
  req: Request<{ id: string }>,
  res: Response,
){
  try {
    const id = req.params.id;
    const post = await postsService.findPostById(id);
    if (!post){
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }
    await postsService.deletePost(id);
    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
