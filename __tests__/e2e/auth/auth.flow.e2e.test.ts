import express from "express";
import { setupApp } from "../../../src/setup-app";
import { client, runDB } from "../../../src/db/mongo.db";
import { SETTINGS } from "../../../src/common/settings/setting";
import request from "supertest";
import { AUTH_PATH, TESTING_PATH } from "../../../src/common/paths/path";
import { HttpStatus } from "../../../src/common/types/http.status";
import { registrationUser } from "../../../test-utils/users/createUser.helper";
import { NodemailerServise } from "../../../src/auth/adapters/nodemailer.server";
import { UsersRepository } from "../../../src/users/infrastructure/user.repository";
import { container } from "../../../src/composition-root";

let root;
let usersRepo: UsersRepository;

describe("AUTH_FLOW_TEST", () => {
  const app = express();
  setupApp(app);

   root = container;
   usersRepo = root.resolve(UsersRepository);

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
  });

  beforeEach(async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await client.close();
  });

  const validDtoCreateUser = {
    login: "admin_7",
    password: "Passw0rd!",
    email: "admin.test@mail.ru",
  };

  //  nodemailerServise.sendEmail = jest
  //   .fn()
  //   .mockImplementation((email: string, code: string, subject: string) =>
  //     Promise.resolve(true),
  //   );

    jest.spyOn(NodemailerServise.prototype, 'sendEmail').mockResolvedValue(true)

  it("registration → confirmation → login → me → refresh → logout → refresh(401)", async () => {
    //РЕГИСТРАЦИЯ
    await registrationUser(app, validDtoCreateUser);

    const user = await usersRepo.findByLogin(validDtoCreateUser.login);

    //ПОДТВЕРЖДЕНИЕ ПОЧТЫ
    await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({ code: user!.emailConfirmation.confirmationCode })
      .expect(HttpStatus.NO_CONTENT);

    //ЛОГИНИЗАЦИЯ - выдаем первые токены
    const loginRes = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({
        loginOrEmail: validDtoCreateUser.login,
        password: validDtoCreateUser.password,
      })
      .expect(HttpStatus.OK);

    const accessToken = loginRes.body.accessToken;

    const cookies = loginRes.headers["set-cookie"];
    if (!Array.isArray(cookies)) {
      throw new Error("set-cookie is not an array");
    }

    const refreshCookie = cookies?.find((c) => c.includes("refreshToken"));
    if (!refreshCookie) {
      throw new Error("No refreshToken cookie");
    }
    const refreshToken = refreshCookie.split(";")[0].split("=")[1];

    //МЕ - ИНФО ПРО ПОЛЬЗОВАТЕЛЯ - через аксес токен
    const resultMe = await request(app)
      .get(`${AUTH_PATH}/me`)
      .set("authorization", `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    // await new Promise((r) => setTimeout(r, 11000)); - мэйби (чтобы аксес токен смог протухнуть)

    //ОБНОВЛЕНИЕ ТОКЕНОВ ЧЕРЕЗ РЕФРЕШЬ
    const resultRefresh = await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .expect(HttpStatus.OK);

    const newCookies = resultRefresh.headers["set-cookie"];
    if (!Array.isArray(newCookies)) {
      throw new Error("set-cookie is not an array");
    }

    const newCookiesRefreshToken = newCookies?.find((c) =>
      c.includes("refreshToken"),
    );
    if (!newCookiesRefreshToken) {
      throw new Error("No refreshToken cookie");
    }

    const newRefreshToken = newCookiesRefreshToken.split(";")[0].split("=")[1];

    await request(app)
      .post(`${AUTH_PATH}/logout`)
      .set("Cookie", [`refreshToken=${newRefreshToken}`])
      .expect(HttpStatus.NO_CONTENT);

    await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set("Cookie", [`refreshToken=${newRefreshToken}`])
      .expect(HttpStatus.UNAUTHORIZED);
  });
});



// import express from "express";
// import request from "supertest";
// import { setupApp } from "../../../src/setup-app";
// import { client, runDB } from "../../../src/db/mongo.db";
// import { SETTINGS } from "../../../src/common/settings/setting";
// import { AUTH_PATH, TESTING_PATH } from "../../../src/common/paths/path";
// import { HttpStatus } from "../../../src/common/types/http.status";
// import { registrationUser } from "../../../test-utils/users/createUser.helper";
// import { usersRepository } from "../../../src/users/infrastructure/user.repository";

// describe("AUTH_FLOW_TEST", () => {
//   const app = express();
//   setupApp(app);

//   beforeAll(async () => {
//     await runDB(SETTINGS.MONGO_URL);
//   });

//   beforeEach(async () => {
//     await request(app)
//       .delete(`${TESTING_PATH}/all-data`)
//       .expect(HttpStatus.NO_CONTENT);
//   });

//   afterAll(async () => {
//     await client.close();
//   });

//   const validDtoCreateUser = {
//     login: "admin_7",
//     password: "Passw0rd!",
//     email: "admin.test@mail.ru",
//   };

//   it("full auth flow with short-lived tokens", async () => {
//     // Регистрация
//     await registrationUser(app, validDtoCreateUser);

//     const user = await usersRepository.findByLogin(validDtoCreateUser.login);

//     // Подтверждение email
//     await request(app)
//       .post(`${AUTH_PATH}/registration-confirmation`)
//       .send({ code: user!.emailConfirmation.confirmationCode })
//       .expect(HttpStatus.NO_CONTENT);

//     // Логин получаем access и refresh токены
//     const loginRes = await request(app)
//       .post(`${AUTH_PATH}/login`)
//       .send({
//         loginOrEmail: validDtoCreateUser.login,
//         password: validDtoCreateUser.password,
//       })
//       .expect(HttpStatus.OK);

//     const accessToken = loginRes.body.accessToken;
//     const cookies = loginRes.headers["set-cookie"];
//       if (!Array.isArray(cookies)) { throw new Error("set-cookie is not an array");}
//     const refreshCookie = cookies?.find((c) => c.includes("refreshToken"));
//     if (!refreshCookie) throw new Error("No refresh token cookie");
//     const refreshToken = refreshCookie.split(";")[0].split("=")[1];

//     // Проверка /me с access токеном
//     await request(app)
//       .get(`${AUTH_PATH}/me`)
//       .set("authorization", `Bearer ${accessToken}`)
//       .expect(HttpStatus.OK);

//     // Ждем немного, чтобы access токен мог устареть
//     await new Promise((r) => setTimeout(r, 11000));

//     // Refresh токен
//     const refreshRes = await request(app)
//       .post(`${AUTH_PATH}/refresh-token`)
//       .set("Cookie", [`refreshToken=${refreshToken}`])
//       .expect(HttpStatus.OK);

//     const newAccessToken = refreshRes.body.accessToken;
//     const newCookies = refreshRes.headers["set-cookie"];
//     if (!Array.isArray(newCookies)) { throw new Error("set-cookie is not an array");}
//     const newRefreshCookie = newCookies?.find((c) => c.includes("refreshToken"));
//     if (!newRefreshCookie) throw new Error("No new refresh token cookie");
//     const newRefreshToken = newRefreshCookie.split(";")[0].split("=")[1];

//     // Логаут — новый refresh токен теперь черный список
//     await request(app)
//       .post(`${AUTH_PATH}/logout`)
//       .set("Cookie", [`refreshToken=${newRefreshToken}`])
//       .expect(HttpStatus.NO_CONTENT);

//     // Попытка refresh с тем же токеном — 401
//     await request(app)
//       .post(`${AUTH_PATH}/refresh-token`)
//       .set("Cookie", [`refreshToken=${newRefreshToken}`])
//       .expect(HttpStatus.UNAUTHORIZED);
//   }, 20000);
// });
