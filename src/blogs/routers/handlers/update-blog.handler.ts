// import { Response, Request } from "express";
// import { HttpStatus } from "../../../common/types/http.status";
// import { BlogInputModel } from "../../dto/blog.dto.model";
// import { BlogsService } from "../../domain/blogs.service";

// export async function updateBlogHandler(
//   req: Request<{ id: string }, {}, BlogInputModel>,
//   res: Response,
// ) {
//   try {
//     const id = req.params.id;

//     const blogReal = await BlogsService.findById(id);

//     if (!blogReal) {
//       return res.sendStatus(HttpStatus.NOT_FOUND);
//     }

//     const dto: BlogInputModel = {
//       name: req.body.name,
//       description: req.body.description,
//       websiteUrl: req.body.websiteUrl,
//     };

//  await BlogsService.updateBlog(id, dto);
//     res.sendStatus(HttpStatus.NO_CONTENT);
//   } catch (err: unknown){
//     res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }
