import request from "supertest";
import { setupApp } from "../../../src/setup-app";
import express from "express";
import { HttpStatus } from "../../../src/common/types/http.status";
import { runDB } from "../../../src/db/mongo.db";
import { SETTINGS } from "../../../src/common/settings/setting";
import { TESTING_PATH, USERS_PATH } from "../../../src/common/paths/path";
import { CreateUserDto } from "../../../src/users/domain/types/dto/create.user.dto"; 
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from "../../../src/auth/guard/super-admin.guard-middleware";
import mongoose from "mongoose";

describe("USERS_TEST", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
  });

  beforeEach(async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
      await mongoose.disconnect();
  });

  const validDtoUser1: CreateUserDto = {
    login: "test_user",
    password: "securePass789",
    email: "test.user@example.com",
  };

  const inValidDtoUser = {
    login: "a",
    password: "P",
    email: "admailru",
  };

  describe("USERS_TEST_ADMIN", () => {
    describe("POST /users", () => {
      describe("validation", () => {
        it("should fail for invalid login", async () => {
          const res = await request(app)
            .post(USERS_PATH)
            .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
            .send({ ...validDtoUser1, login: "" })
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body).toHaveProperty("errorsMessages");
        });

        it("should fail for invalid email", async () => {
          const res = await request(app)
            .post(USERS_PATH)
            .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
            .send({ ...validDtoUser1, email: "wrong email" })
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body).toHaveProperty("errorsMessages");
        });

        it("should fail for invalid password", async () => {
          const res = await request(app)
            .post(USERS_PATH)
            .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
            .send({ ...validDtoUser1, password: "" })
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body).toHaveProperty("errorsMessages");
        });
      });

      it("should create user through the admin and return new user: STATUS 201", async () => {
        const createdUser = await request(app)
          .post(USERS_PATH)
          .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
          .send(validDtoUser1)
          .expect(HttpStatus.CREATED);

        expect(createdUser.body).toHaveProperty("id");
        expect(createdUser.body.email).toBe(validDtoUser1.email);
        expect(createdUser.body.login).toBe(validDtoUser1.login);
      });

      it("shouldn`t create user for invalid input data: STATUS 400", async () => {
        //надо наверное удалить

        const res = await request(app)
          .post(USERS_PATH)
          .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
          .send(inValidDtoUser)
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("shouldn`t create user without authorization: STATUS 401", async () => {
        await request(app).post(USERS_PATH).expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

});
