import { Router, Response, Request } from 'express';
import { blogCollection, commentsCollection, postCollection, refreshTokenCollection, userCollection } from '../db/mongo.db';
import { HttpStatus } from '../common/types/http.status';

export const testingRouter = Router();

testingRouter
   .delete("/all-data", async (req: Request, res: Response) => {
      await Promise.all([
   blogCollection.deleteMany(),
   postCollection.deleteMany(),
   userCollection.deleteMany(),
   commentsCollection.deleteMany(),
   refreshTokenCollection.deleteMany(),
   ])
   res.sendStatus(HttpStatus.NO_CONTENT);
});