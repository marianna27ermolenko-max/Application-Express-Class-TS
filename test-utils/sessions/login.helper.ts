import { AUTH_PATH } from "../../src/common/paths/path";
import { HttpStatus } from "../../src/common/types/http.status";
import { CreateUserDto } from "../../src/users/domain/types/dto/create.user.dto"; 
import request from "supertest";
import { Express } from "express";
import jwt from "jsonwebtoken";

export interface UserTokens {
  accessToken: string;
  refreshToken: string;
  cookies: string[];
  deviceId: string;
}

export const loginAndGetTokens = async (
  app: Express,
  dto: CreateUserDto,
  userAgent: string,
  ip: string,
): Promise<UserTokens> => {
  const res = await request(app)
    .post(`${AUTH_PATH}/login`)
    .send({ loginOrEmail: dto.login, password: dto.password })
    .set("User-Agent", userAgent)
    .set("X-Forwarded-For", ip)
    .expect(HttpStatus.OK);

  const accessToken = res.body.accessToken;
  const cookies = res.headers["set-cookie"];
  if (!Array.isArray(cookies)) {
    throw new Error("No cookies");
  }

  const refreshCookie = cookies.find((c) => c.includes("refreshToken"));
  const refreshToken = refreshCookie.split(";")[0].split("=")[1];

  const payload: any = await jwt.decode(refreshToken);
  const deviceId = payload.deviceId;

  return { accessToken, refreshToken, cookies, deviceId };
};
