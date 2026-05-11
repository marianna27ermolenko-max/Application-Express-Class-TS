import mongoose from "mongoose";
import request from "supertest";
import { setupApp } from "../../../src/setup-app";
import express from "express";
import { HttpStatus } from "../../../src/common/types/http.status";
import { SETTINGS } from "../../../src/common/settings/setting";
import { runDB } from "../../../src/db/mongo.db";
import {
  BLOGS_PATH,
  COMMENTS_PATH,
  POSTS_PATH,
  TESTING_PATH,
} from "../../../src/common/paths/path";
import { fullCreateUserWithToken } from "../../../test-utils/auth/fullCreateUserWithTokens.helper";
import { BlogViewModel } from "../../../src/blogs/types/blog.type";
import { createBlog } from "../../../test-utils/blogs/createBlog.helper";
import { BlogInputModel } from "../../../src/blogs/dto/blog.dto.model";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from "../../../src/auth/guard/super-admin.guard-middleware";
import { LikeStatus } from "../../../src/comments/domain/like.comment.entity"; 

describe("LIKE_COMMENT_TEST", () => {
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

  const InvalidDtoUser = {
    login: "",
    password: "",
    email: "wrong email",
  };

  const validDtoCreateUser = {
    login: "admin_7",
    password: "Passw0rd!",
    email: "admin.test@mail.ru",
  };

  const validDtoBlog: BlogInputModel = {
    name: "TechBlog",
    description: "Блог о современных технологиях и IT трендах",
    websiteUrl: "https://mytechblog.com",
  };

  describe("PUT /comments/like-status", () => {
    it("STATUS 204", async () => {
      //сначала создать пользователя - залогинить
      const { user, accessToken } = await fullCreateUserWithToken(
        app,
        validDtoCreateUser,
      );

      //создать блог у которого будет пост
      const blog: BlogViewModel = await createBlog(app, validDtoBlog);
      //проверяем что блог сохранился - надо ?
      const getBlogRes = await request(app)
        .get(`${BLOGS_PATH}/${blog.id}`)
        .expect(HttpStatus.OK);

      //потом у нас должен быть пост чтобы к нему добавить коммент, а потом и лайк к этому комменту
      //!!! создать пост может только авторизованный админ - басик

      const dtoPost = {
        title: "How to learn NestJS",
        shortDescription: "A short guide for beginner backend developers",
        content: "In this post we will look at the main NestJS",
        blogId: blog.id,
      };

      const post = await request(app)
        .post(POSTS_PATH)
        .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
        .send(dtoPost)
        .expect(HttpStatus.CREATED);

      expect(post.body).toHaveProperty("id");
      expect(post.body.title).toBe(dtoPost.title);
      expect(post.body.content).toBe(dtoPost.content);

      //этот пользователь должен создать коммент к опр. посту
      const postId = post.body.id;
      const comment = await request(app)
        .post(`${POSTS_PATH}/${postId}/comments`)
        .set("authorization", `Bearer ${accessToken}`)
        .send({
          content: "hello, dear friend! How are yuooooooooooooo piy piy",
        })
        .expect(HttpStatus.CREATED);

      expect(comment.body.likesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      });

      const commentId = comment.body.id;
      const FirstLike = await request(app)
        .get(`${COMMENTS_PATH}/${commentId}`)
        .set("authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

        expect(FirstLike.body).toEqual(
          {
  "id": expect.any(String),
  "content": "hello, dear friend! How are yuooooooooooooo piy piy",
  "commentatorInfo": {
    "userId": expect.any(String),
    "userLogin": expect.any(String)
  },
  "createdAt": expect.any(String),
  "likesInfo": {
    "likesCount": 0,
    "dislikesCount": 0,
    "myStatus": "None"
  }
}
        )

      //ставим лайк к созд. комменту
      // const commentId = comment.body.id;
      await request(app)
        .put(`${COMMENTS_PATH}/${commentId}/like-status`)
        .set("authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: LikeStatus.Like })
        .expect(HttpStatus.NO_CONTENT);

      const afterLike = await request(app)
        .get(`${COMMENTS_PATH}/${commentId}`)
        .set("authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(afterLike.body.likesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: "Like",
      });


      await request(app)
        .put(`${COMMENTS_PATH}/${commentId}/like-status`)
        .set("authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: LikeStatus.Dislike })
        .expect(HttpStatus.NO_CONTENT);

      const afterDislike = await request(app)
        .get(`${COMMENTS_PATH}/${commentId}`)
        .set("authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(afterDislike.body.likesInfo.myStatus).toBe("Dislike");

      await request(app)
        .put(`${COMMENTS_PATH}/${commentId}/like-status`)
        .set("authorization", `Bearer ${accessToken}`)
        .send({ likeStatus: LikeStatus.None })
        .expect(HttpStatus.NO_CONTENT);

      const afterNone = await request(app)
        .get(`${COMMENTS_PATH}/${commentId}`)
        .set("authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(afterNone.body.likesInfo.myStatus).toBe("None");
    });
  });
});
