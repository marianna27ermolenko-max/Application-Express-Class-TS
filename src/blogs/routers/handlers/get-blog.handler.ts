// import { Response, Request } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { BlogsService } from "../../domain/blogs.service";

// export async function getBlogHandler(req: Request<{id: string}>, res: Response){ 
// try{
//       const id = req.params.id;
//       const blog = await BlogsService.findBlogById(id); 
//       if (!blog) {
//         return res.sendStatus(HttpStatus.NOT_FOUND);
//       }
//       res.status(HttpStatus.OK).json(blog);
//     } catch (err: unknown){
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }