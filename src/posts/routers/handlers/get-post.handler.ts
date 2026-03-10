import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { mapToPostViewMolel } from "../mappers/map-to-post-model";
import { postsService } from "../../domain/posts.service";

export async function getPostHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const id = req.params.id;
    const getIdPost = await postsService.findPostById(id);

    if (!getIdPost) {
      return res.sendStatus(HttpStatus.NOT_FOUND);
    }
    res.status(HttpStatus.OK).json(mapToPostViewMolel(getIdPost));
  } catch (err: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
