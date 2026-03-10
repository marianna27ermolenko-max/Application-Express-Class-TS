import { Response, Request } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { mapToBlogViewModel } from "../mappers/map-blog-view-model";
import { blogsService } from "../../domain/blogs.service";

export async function getBlogHandler(req: Request<{id: string}>, res: Response){ //ДОБАВИТЬ ПАГИНАЦИЮ В ОТВЕТ - ТО ЕСТЬ У НАС БУДУТ КВАРИ ПАРАМЕТРЫ 
try{
      const id = req.params.id;
      const blog = await blogsService.findByIdOrFail(id); 
      if (!blog) {
        return res.sendStatus(HttpStatus.NOT_FOUND);
      }
      res.status(HttpStatus.OK).json(mapToBlogViewModel(blog));
    } catch (err: unknown){
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }