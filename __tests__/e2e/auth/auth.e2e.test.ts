import request from "supertest";
import { setupApp } from "../../../src/setup-app";
import express from "express";
import { SETTINGS } from "../../../src/common/settings/setting";
import { client, runDB, userCollection } from "../../../src/db/mongo.db";
import {
  AUTH_PATH,
  TESTING_PATH,
  USERS_PATH,
} from "../../../src/common/paths/path";
import { HttpStatus } from "../../../src/common/types/http.status";
import {
  createUser,
  registrationUser,
} from "../../../test-utils/users/createUser.helper";
import { testSeederUserDTO } from "../../../test-utils/seeder/test.seeder";
import { fullCreateUserWithToken } from "../../../test-utils/auth/fullCreateUserWithTokens.helper";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from "../../../src/auth/guard/super-admin.guard-middleware";
import { registerAndConfirmUser } from "../../../test-utils/sessions/registration.helper";
import { loginAndGetTokens } from "../../../test-utils/sessions/login.helper";
import { container } from "../../../src/composition-root";
import { ObjectId } from "mongodb";
import { AuthService } from "../../../src/auth/domain/auth.service";
import { UsersRepository } from "../../../src/users/infrastructure/user.repository";
import { SessionsRepository } from "../../../src/security-devices/infrastructure/security-devices.repository";
import { NodemailerServise } from "../../../src/auth/adapters/nodemailer.server";

let root;
let authService: AuthService;
let usersRepo: UsersRepository;
let sessionsRepo: SessionsRepository;

describe("AUTH_TEST", () => {
  const app = express();
  setupApp(app);

    root = container
    authService = root.resolve(AuthService)
    usersRepo = root.resolve(UsersRepository)
    sessionsRepo = root.resolve(SessionsRepository)

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

  // nodemailerServise.sendEmail = jest
  //     .fn()
  //     .mockImplementation((email: string, code: string, subject: string) =>
  //       Promise.resolve(true),
  //     );

  jest.spyOn(NodemailerServise.prototype, 'sendEmail').mockResolvedValue(true)

  describe("POST /login", () => {
    describe("validation", () => {
      it("should not try login user to the system through invalid login: STATUS 400", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: InvalidDtoUser.login,
            password: InvalidDtoUser.password,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("should not try login user to the system through invalid email: STATUS 400", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: InvalidDtoUser.email,
            password: InvalidDtoUser.password,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });
    });

    describe("success (200)", () => {
      it("should try registration user to the system through login and get AccsesToken: STATUS 200", async () => {
        await createUser(app, validDtoCreateUser);

        const res = await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty("accessToken");
        expect(typeof res.body.accessToken).toBe("string");

        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();

        if (!Array.isArray(cookies)) {
          throw new Error("set-cookie is not an array");
        }
        expect(cookies.some((cookie) => cookie.includes("refreshToken"))).toBe(
          true,
        );
      });

      it("should try login user to the system through email and get AccsesToken: STATUS 200", async () => {
        await createUser(app, validDtoCreateUser);

        const res = await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: validDtoCreateUser.email,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty("accessToken");
        expect(typeof res.body.accessToken).toBe("string");
      });
    });

    describe("authentication (401)", () => {
      it("should not login with non-existing email: STATUS 401", async () => {
        await createUser(app, validDtoCreateUser);

        await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: "wrong@mail.com",
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not login with non-existing login: STATUS 401", async () => {
        await createUser(app, validDtoCreateUser);

        await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: "wrongLogin",
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not login with wrong password: STATUS 401", async () => {
        await createUser(app, validDtoCreateUser);

        await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: "wrong password",
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not login without email confirm: STATUS 401", async () => {
        await testSeederUserDTO.insertUser(validDtoCreateUser);

        const res = await request(app)
          .post(`${AUTH_PATH}/login`)
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(res.body.errorsMessages?.[0].message).toBe("Email not confirm");
      });
    });
    
    describe("status 429", () => {
      it("should not login user if custom rate limit more than 5 times: STATUS 429", async () => {
          await registerAndConfirmUser(app, validDtoCreateUser);     

          for(let i = 0; i < 5; i++){

          await request(app)
          .post(`${AUTH_PATH}/login`)
          .set("X-Forwarded-For", '1.1.1.1')
          .set("User-Agent", 'device')
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.OK);

          }

          await request(app)
          .post(`${AUTH_PATH}/login`)
          .set("X-Forwarded-For", '1.1.1.1')
          .set("User-Agent", 'device')
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.TOO_MANY_REQUESTS);

      })
    })
  });

  describe("POST /registration", () => {
    describe("validation", () => {
      it("should not try login user to the system through invalid login: STATUS 400", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/registration`)
          .send({
            login: InvalidDtoUser.login,
            password: validDtoCreateUser.password,
            email: validDtoCreateUser.email,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("should not try login user to the system through invalid email: STATUS 400", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/registration`)
          .send({
            login: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
            email: InvalidDtoUser.email,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("should not try login user to the system through invalid password: STATUS 400", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/registration`)
          .send({
            login: validDtoCreateUser.login,
            password: InvalidDtoUser.password,
            email: validDtoCreateUser.email,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });
    });

    it("should register user with correct data: STATUS 204", async () => {
      await registrationUser(app, validDtoCreateUser);
    });

    it("should not register user twice: STATUS 400", async () => {
      await registrationUser(app, validDtoCreateUser);

      const res = await request(app)
        .post(`${AUTH_PATH}/registration`)
        .send(validDtoCreateUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty("errorsMessages");
    });
  });

  describe("POST /registration-confirmation", () => {
    it("validation", async () => {
      const res = await request(app)
        .post(`${AUTH_PATH}/registration-confirmation`)
        .send({ code: "" })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty("errorsMessages");
    });

    describe("STATUS 400", () => {
      it("should not account activated with expired code", async () => {
        const time = new Date(Date.now() - 1000);
        const user = await testSeederUserDTO.insertUser({
          login: "admin_7",
          password: "Passw0rd!",
          email: "admin.test@mail.ru",
          expirationDate: time,
        });

        const res = await request(app)
          .post(`${AUTH_PATH}/registration-confirmation`)
          .send({ code: user.emailConfirmation.confirmationCode })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("should not account activated with already active email", async () => {
        const user = await testSeederUserDTO.insertUser({
          login: "admin_7",
          password: "Passw0rd!",
          email: "admin.test@mail.ru",
          isConfirmed: true,
        });

        const res = await request(app)
          .post(`${AUTH_PATH}/registration-confirmation`)
          .send({ code: user.emailConfirmation.confirmationCode })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("should not activate account if user does not exist", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/registration-confirmation`)
          .send({ code: "gdhfjikd2518shsks98v" })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });
    });

    describe("STATUS 204", () => {
      it("should account activated with valid code and email", async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);

        await request(app)
          .post(`${AUTH_PATH}/registration-confirmation`)
          .send({ code: user.emailConfirmation.confirmationCode })
          .expect(HttpStatus.NO_CONTENT);
      });
    });
  });

  describe("POST /registration-email-resending", () => {
    describe("STATUS 400", () => {
      it("should not active user with not valid email: STATUS 400", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/registration-email-resending`)
          .send({ email: "" })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("should not activate account if user does not exist", async () => {
        const res = await request(app)
          .post(`${AUTH_PATH}/registration-email-resending`)
          .send({ email: "hello@mail.ruu" })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });

      it("should not account activated with already active email", async () => {
        const user = await testSeederUserDTO.insertUser({
          login: "admin_7",
          password: "Passw0rd!",
          email: "admin.test@mail.ru",
          isConfirmed: true,
        });

        const res = await request(app)
          .post(`${AUTH_PATH}/registration-email-resending`)
          .send({ email: user.accountData.email })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty("errorsMessages");
      });
    });
    describe("STATUS 204", () => {
      it("STATUS 204", async () => {
        await registrationUser(app, validDtoCreateUser);

        await request(app)
          .post(`${AUTH_PATH}/registration-email-resending`)
          .send({ email: validDtoCreateUser.email })
          .expect(HttpStatus.NO_CONTENT);
      });
    });
  });

  describe("POST /refresh-token", () => {
    describe("STATUS 200", () => {
      it("should update tokens with active refreshToken", async () => {
        const { refreshToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );

        const result = await request(app)
          .post(`${AUTH_PATH}/refresh-token`)
          .set("Cookie", [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.OK);

        expect(result.body).toHaveProperty("accessToken");
        expect(typeof result.body.accessToken).toBe("string");

        const newCookies = result.headers["set-cookie"];
        expect(newCookies).toBeDefined();
        if (!Array.isArray(newCookies)) {
          throw new Error("set-cookie is not an array");
        }
        expect(
          newCookies.some((cookie) => cookie.includes("refreshToken")),
        ).toBe(true);
      });
    });

  describe("STATUS 401", () => {
    it("should not update tokens if refreshToken not be in cookies", async () => {
      await request(app)
        .post(`${AUTH_PATH}/refresh-token`)
        .set("Cookie", [])
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should not update tokens if lastActiveDate session doesn't match with iat refresh token", async () => { //переписать тест - поменялись условия 
      await registerAndConfirmUser(app, validDtoCreateUser);
      const device1 = await loginAndGetTokens( app, validDtoCreateUser, "device-1", '1.1.1.1');
      const { refreshToken } = device1;

      await sessionsRepo.updateLastActiveDate(  device1.deviceId, "2000-01-01T00:00:00.000Z");
      
      await request(app)
        .post(`${AUTH_PATH}/refresh-token`)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(HttpStatus.UNAUTHORIZED);  

    });

    it("should not update tokens if user not exist", async () => {
      const { refreshToken } = await fullCreateUserWithToken( app, validDtoCreateUser, );
      const user = await usersRepo.findByEmail(validDtoCreateUser.email);

      await request(app)
        .delete(`${USERS_PATH}/${user?._id}`)
        .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
        .expect(HttpStatus.NO_CONTENT);

      await request(app)
        .post(`${AUTH_PATH}/refresh-token`)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should not update tokens if refresh token is expired", async () => {
      const { refreshToken } = await fullCreateUserWithToken(
        app,
        validDtoCreateUser,
      );
      await new Promise((res) => setTimeout(res, 21000));

      await request(app)
        .post(`${AUTH_PATH}/refresh-token`)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(HttpStatus.UNAUTHORIZED);
    }, 30000);
  });
  });

  describe("POST /logout", () => {
    describe("STATUS 204", () => {
      it("should will be revoked with correct refresh token", async () => {
        const { refreshToken } = await fullCreateUserWithToken( app, validDtoCreateUser,);

        await request(app)
          .post(`${AUTH_PATH}/logout`)
          .set("Cookie", [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.NO_CONTENT);

        await request(app)
          .post(`${AUTH_PATH}/refresh-token`)
          .set("Cookie", [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe("STATUS 401", () => {
      it("should not revoked if have not refresh token", async () => {
        await request(app)
          .post(`${AUTH_PATH}/logout`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not revoke with invalid refresh token", async () => {
        await request(app)
          .post(`${AUTH_PATH}/refresh-token`)
          .set("Cookie", [`refreshToken=invalid_token`])
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("GET /me", () => {
    describe("STATUS 200", () => {
      it("should get information about current user", async () => {
        const { accessToken } = await fullCreateUserWithToken( app, validDtoCreateUser );

        const result = await request(app)
          .get(`${AUTH_PATH}/me`)
          .set("authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(result.body.email).toBe(validDtoCreateUser.email);
        expect(result.body.login).toBe(validDtoCreateUser.login);
        expect(result.body.userId).toBeDefined();
      });
    });

    describe("STATUS 401", () => {
      it("should return 401 if access token is missing", async () => {
        await request(app)
          .get(`${AUTH_PATH}/me`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should return 401 if access token is invalid", async () => {
        await request(app)
          .get(`${AUTH_PATH}/me`)
          .set("authorization", `Bearer invalid_token`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not get information if user not exist", async () => {
        const { accessToken } = await fullCreateUserWithToken( app, validDtoCreateUser );
        const user = await usersRepo.findByEmail( validDtoCreateUser.email );

        await request(app)
          .delete(`${USERS_PATH}/${user?._id}`)
          .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
          .expect(HttpStatus.NO_CONTENT);

        await request(app)
          .get(`${AUTH_PATH}/me`)
          .set("authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not get information if access token expired", async () => {
        const { accessToken } = await fullCreateUserWithToken( app, validDtoCreateUser );

        await new Promise((res) => setTimeout(res, 11000)); // ждем истечения времени жизни токена

        await request(app)
          .get(`${AUTH_PATH}/me`)
          .set("authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.UNAUTHORIZED);
      }, 
      20000);
    });
  });

  describe('POST /password-recovery', () => {

    describe("STATUS 204", () => {
      it("should confirm password recovery", async () => {
      const user = await testSeederUserDTO.insertUser(validDtoCreateUser)
      await request(app)
            .post(`${AUTH_PATH}/password-recovery`)
            .send({email: user.accountData.email})  
            .expect(HttpStatus.NO_CONTENT);

      })

       it("should confirm password recovery if email not found", async () => {
     
      await request(app)
            .post(`${AUTH_PATH}/password-recovery`)
            .send({email: validDtoCreateUser.email})  
            .expect(HttpStatus.NO_CONTENT);
      })


    })

      describe("STATUS 400", () => {
      it("should not get code if the inputModel has invalid email", async () => {
    
      await request(app)
            .post(`${AUTH_PATH}/password-recovery`)
            .send({email: InvalidDtoUser.email})  
            .expect(HttpStatus.BAD_REQUEST);

      })
  });

   describe("STATUS 429", () => {
      it("should not get code more than 5 attempts from one IP-address during 10 seconds", async () => {
      const user = await testSeederUserDTO.insertUser(validDtoCreateUser)
      
      for(let i = 0; i < 5; i++){   
        
        await request(app)
            .post(`${AUTH_PATH}/password-recovery`)
            .send({email: user.accountData.email})  
            .expect(HttpStatus.NO_CONTENT);
      }

         await request(app)
            .post(`${AUTH_PATH}/password-recovery`)
            .send({email: user.accountData.email})  
            .expect(HttpStatus.TOO_MANY_REQUESTS);
    })
  
  });
  });


  describe('POST /new-password', () => {

   describe("STATUS 204", () => {
      it("should update new password with current recovery code", async () => {
      const user = await testSeederUserDTO.insertUser(validDtoCreateUser)

      await request(app)
            .post(`${AUTH_PATH}/password-recovery`)
            .send({email: user.accountData.email})  
            .expect(HttpStatus.NO_CONTENT);

       const updatedUser = await userCollection.findOne({ _id: new ObjectId(user.id) });
       const recoveryCode = updatedUser!.recoveryCode!.confirmationCode!;

      await request(app)
            .post(`${AUTH_PATH}/new-password`)
            .send({ newPassword: "string145", recoveryCode: recoveryCode})  
            .expect(HttpStatus.NO_CONTENT);

      })
    })

     describe("STATUS 400", () => {
      it("should not update new password for incorrect password length", async () => {
      const user = await testSeederUserDTO.insertUser(validDtoCreateUser)
     
      await request(app)
            .post(`${AUTH_PATH}/new-password`)
            .send({ newPassword: "str", recoveryCode: user.recoveryCode.confirmationCode})  
            .expect(HttpStatus.BAD_REQUEST);

      })

         it("should not update new password recoveryCode is incorrect", async () => {
      const user = await testSeederUserDTO.insertUser(validDtoCreateUser)
     
      await request(app)
            .post(`${AUTH_PATH}/new-password`)
            .send({ newPassword: "strigbb", recoveryCode: 'gpopopo159'})  
            .expect(HttpStatus.BAD_REQUEST);

      })

         it("should not update new password recoveryCode is expired", async () => {
      const user = await testSeederUserDTO.insertUser(validDtoCreateUser)

      const expiredCode = '159852354dhghfg753';
      const expiredDate = new Date(Date.now() - 1000 * 60 * 60);

      const update = await userCollection.updateOne({_id: new ObjectId(user.id)}, {$set: { 
        'recoveryCode.confirmationCode': expiredCode,
        'recoveryCode.expirationDate': expiredDate }})
     
      await request(app)
            .post(`${AUTH_PATH}/new-password`)
            .send({ newPassword: "strigbb", recoveryCode: expiredCode })  
            .expect(HttpStatus.BAD_REQUEST);

      })
    })


  });
});
