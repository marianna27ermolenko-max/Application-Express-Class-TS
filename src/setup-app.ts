import express, { Express, Request, Response } from 'express';
import { blogsRouter } from './blogs/routers/routers.blog'; 
import { postsRouter } from './posts/routers/router.post';
import { testingRouter } from './testing/testing.routers';
import { AUTH_PATH, BLOGS_PATH, POSTS_PATH, TESTING_PATH, USERS_PATH } from './common/paths/path';
import { setupSwagger } from './common/swagger/setup-swagger';
import { usersRouter } from './users/api/users.router';
import { authRouter } from './auth/api/auth.router';

export const setupApp = (app: Express) => {

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello users!');
});

app.use(BLOGS_PATH, blogsRouter);
app.use(POSTS_PATH, postsRouter);
app.use(TESTING_PATH, testingRouter);
app.use(USERS_PATH, usersRouter);
app.use(AUTH_PATH, authRouter);

 setupSwagger(app);
 return app;
}

