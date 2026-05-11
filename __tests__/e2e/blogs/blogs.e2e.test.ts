import request from "supertest";
import { setupApp } from "../../../src/setup-app";
import express from "express";
import { HttpStatus } from "../../../src/common/types/http.status";
import { BlogInputModel } from "../../../src/blogs/dto/blog.dto.model";
import { BlogViewModel } from "../../../src/blogs/types/blog.type";
import { createBlog } from "../../../test-utils/blogs/createBlog.helper";
import { BLOGS_PATH, TESTING_PATH } from "../../../src/common/paths/path";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from "../../../src/auth/guard/super-admin.guard-middleware";
import { SETTINGS } from "../../../src/common/settings/setting";
import { runDB } from "../../../src/db/mongo.db";
import mongoose from "mongoose";

describe("BLOGS_TEST", () => {
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

  const validDtoBlog: BlogInputModel = {
    name: "TechBlog",
    description: "Блог о современных технологиях и IT трендах",
    websiteUrl: "https://mytechblog.com",
  };

  const inValidDtoBlog: BlogInputModel = {
    name: "",
    description: "",
    websiteUrl: "wrong URL",
  };

  describe("POST /blogs", () => {
    it("should  create blog and returns the newly created blog and status 201", async () => {
      const createdBlog: BlogViewModel = await createBlog(app, validDtoBlog);

      expect(createdBlog).toHaveProperty("id"); //должеы проверить что вернули нужные поля
      expect(createdBlog.name).toBe(validDtoBlog.name);
      expect(createdBlog.description).toBe(validDtoBlog.description);
      expect(createdBlog.websiteUrl).toBe(validDtoBlog.websiteUrl);
      expect(createdBlog).toHaveProperty("createdAt");
      expect(createdBlog).toHaveProperty("isMembership"); //boolean проверить можно

      const getBlogRes = await request(app)
        .get(`${BLOGS_PATH}/${createdBlog.id}`) //ДОЛЖНЫ ПРОВЕРИТЬ В ГЕТ ЧТО БЛОГ сохранился
        .expect(HttpStatus.OK);

      expect(getBlogRes.body.id).toBe(createdBlog.id);
      expect(getBlogRes.body.name).toBe(validDtoBlog.name);
      expect(getBlogRes.body.description).toBe(validDtoBlog.description);
      expect(getBlogRes.body.websiteUrl).toBe(validDtoBlog.websiteUrl);
    });

    it("shouldn`t create blog for invalid input data: STATUS 400", async () => {

      const res = await request(app)
        .post(BLOGS_PATH)
        .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
        .send(inValidDtoBlog)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty("errorsMessages");
    });

    it("shouldn`t create blog without authorization: STATUS 401", async () => {
       await request(app)
        .post(BLOGS_PATH)
        .auth("e", "b")
        .send(validDtoBlog)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("DELETE /blogs/:id", () => {
    it("should delete blog by id: STATUS 204", async () => {
      const createdBlog: BlogViewModel = await createBlog(app, validDtoBlog);

      await request(app)
        .delete(`${BLOGS_PATH}/${createdBlog.id}`)
        .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
        .expect(HttpStatus.NO_CONTENT);

      await request(app)
         .get(`${BLOGS_PATH}/${createdBlog.id}`)
         .expect(HttpStatus.NOT_FOUND);
    });

    it("should not delete blog by id if specified blog is not exists: STATUS 404", async () => {
       await request(app)
        .delete(`${BLOGS_PATH + "/652f4167b3d2a5c9518a9e4c"}`)
        .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("shouldn`t delete blog by id which don`t have authtorization: STATUS 401", async () => {
       await request(app)
        .delete(`${BLOGS_PATH + "/652f4167b3d2a5c9518a9e4c"}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
