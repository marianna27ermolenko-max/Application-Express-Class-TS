//мидлваре, где аксес не обязателен

import { Request, Response, NextFunction } from "express";
import { container } from "../../composition-root";
import { JwtService } from "../adapters/jwt.service";
import { UsersRepository } from "../../users/infrastructure/user.repository";

const jwtService = container.resolve(JwtService);
const usersRepo = container.resolve(UsersRepository);

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers["authorization"] as string;
  if (auth) {
    const [authType, token] = auth.split(" ");
    if (authType === "Bearer" && token) {
      const userId = await jwtService.getUserIdFromAccessToken(token);

      if (userId) {
        const user = await usersRepo.findById(userId);
        if (user) {
          req.userId = user._id.toString();
        }
      }
    }
  }

  next();
};
