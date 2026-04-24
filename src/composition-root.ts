import "reflect-metadata";
import { Container } from 'inversify'

import { BcryptService } from "./auth/adapters/bcrypt.service";
import { JwtService } from "./auth/adapters/jwt.service";
import { NodemailerServise } from "./auth/adapters/nodemailer.server";
import { AuthController } from "./auth/api/handlers/authHandlers";
import { AuthService } from "./auth/domain/auth.service";
import { BlogsService } from "./blogs/domain/blogs.service";
import { BlogsQWRepository } from "./blogs/infrastructure/blogs-QWrepositories";
import { BlogsRepository } from "./blogs/infrastructure/blogs-repositories";
import { BlogsController } from "./blogs/routers/handlers/blogsHandlers";
import { CommentsController } from "./comments/api/handlers/commentsHandler";
import { CommentsServer } from "./comments/domain/comments.service";
import { CommentsQrRepository } from "./comments/infrastructure/comments.query.repository";
import { CommentsRepository } from "./comments/infrastructure/comments.repository";
import { PostController } from "./posts/api/handlers/handler.posts";
import { PostsService } from "./posts/domain/posts.service";
import { PostsQwRepository } from "./posts/repositories/post-query.repositories";
import { PostsRepository } from "./posts/repositories/post-repositories";
import { SecurityDevicesController } from "./security-devices/api/handlers/handler.security-devices";
import { SecurityDevicesService } from "./security-devices/domain/security-devices.service";
import { SessionsQwRepository } from "./security-devices/infrastructure/security-devices.QwRepository";
import { SessionsRepository } from "./security-devices/infrastructure/security-devices.repository";
import { UsersController } from "./users/api/handlers/handler.users.class";
import { UsersService } from "./users/domain/users.service";
import { UsersQwRepository } from "./users/infrastructure/user.query.repository";
import { UsersRepository } from "./users/infrastructure/user.repository";


export const container = new Container();

container.bind(UsersRepository).to(UsersRepository);
container.bind(UsersQwRepository).to(UsersQwRepository);
container.bind(SessionsRepository).to(SessionsRepository);
container.bind(SessionsQwRepository).to(SessionsQwRepository);
container.bind(PostsRepository).to(PostsRepository);
container.bind(PostsQwRepository).to(PostsQwRepository);
container.bind(BlogsRepository).to(BlogsRepository);
container.bind(BlogsQWRepository).to(BlogsQWRepository);
container.bind(CommentsQrRepository).to(CommentsQrRepository);
container.bind(CommentsRepository).to(CommentsRepository);

container.bind(NodemailerServise).to(NodemailerServise);
container.bind(JwtService).to(JwtService);
container.bind(BcryptService).to(BcryptService);

container.bind(SecurityDevicesService).to(SecurityDevicesService);
container.bind(UsersService).to(UsersService);
container.bind(PostsService).to(PostsService);
container.bind(BlogsService).to(BlogsService);
container.bind(AuthService).to(AuthService);
container.bind(CommentsServer).to(CommentsServer);

container.bind(UsersController).to(UsersController);
container.bind(SecurityDevicesController).to(SecurityDevicesController);
container.bind(PostController).to(PostController);
container.bind(CommentsController).to(CommentsController);
container.bind(BlogsController).to(BlogsController);
container.bind(AuthController).to(AuthController);
