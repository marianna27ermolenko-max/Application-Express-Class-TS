import { Router, Response, Request } from 'express';
import { HttpStatus } from '../common/types/http.status';
import { SessionModel } from "../security-devices/domain/securety-devices.entity"; 
import { PostModel } from '../posts/domain/post.entity'; 
import { CommentModel } from '../comments/domain/comment.entity'; 
import { BlogModel } from '../blogs/domain/blogs.entity'; 
import { CustomModel } from '../common/custom-rate-limit/custom-rate-limit.entity';
import { UserModel } from '../users/domain/users.entity';

export const testingRouter = Router();

testingRouter
   .delete("/all-data", async (req: Request, res: Response) => {
      await Promise.all([
   BlogModel.deleteMany(),
   PostModel.deleteMany(),
   UserModel.deleteMany(),
   CommentModel.deleteMany(),
   SessionModel.deleteMany(),
   CustomModel.deleteMany(),
   ])
   res.sendStatus(HttpStatus.NO_CONTENT);
});