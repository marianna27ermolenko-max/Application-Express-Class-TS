// import { Response, Request } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { APIErrorResult } from "../../../common/utils/APIErrorResult";
// import { BlogsService } from "../../domain/blogs.service";

// export async function deleteBlogHandler(req: Request<{id: string}>, res: Response){
// try{
//         const id = req.params.id;
//         const deleteBlog = await BlogsService.findById(id);

//         if(!deleteBlog){
//             res.status(HttpStatus.NOT_FOUND).send(
//               APIErrorResult([{field: 'id', message: 'Blog not found' }])
//             );
//             return;
//         }
//          await BlogsService.deleteBlog(id);
//          res.sendStatus(HttpStatus.NO_CONTENT);
// } catch (err: any){
//   res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
// }}