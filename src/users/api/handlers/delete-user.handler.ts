import { Response } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { RequestWithParams } from "../../../common/types/requests";
import { IdType } from "../../../common/types/id";
import { usersService } from "../../domain/users.service";

export async function deleteUserHandler(
  req: RequestWithParams<IdType>,
  res: Response<string>,
) {
  try {
    const user = await usersService.deleteUser(req.params.id);
    if (!user) return res.sendStatus(HttpStatus.NOT_FOUND);

    return res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
