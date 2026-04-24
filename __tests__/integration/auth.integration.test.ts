import request from "supertest";
import { setupApp } from "../../src/setup-app";
import express from "express";
import { client, runDB } from "../../src/db/mongo.db";
import { TESTING_PATH } from "../../src/common/paths/path";
import { HttpStatus } from "../../src/common/types/http.status";
import { SETTINGS } from "../../src/common/settings/setting";
import { NodemailerServise } from "../../src/auth/adapters/nodemailer.server";
import { testSeederUserDTO } from "../../test-utils/seeder/test.seeder"; 
import { AuthService } from "../../src/auth/domain/auth.service";
import { ResultStatus } from "../../src/common/result/resultCode";
import { UsersRepository } from "../../src/users/infrastructure/user.repository";
import { container } from "../../src/composition-root";

let root;
let authService: AuthService;
let userRepo: UsersRepository;

describe("AUTH_TEST", () => {
  const app = express();
  setupApp(app);

  root = container
  authService = root.resolve(AuthService)
  userRepo = root.resolve(UsersRepository)

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

  jest.spyOn(NodemailerServise.prototype, 'sendEmail').mockResolvedValue(true)

  describe("User registration", () => {
    it("should register user with correct data", async () => {
      const { login, email, password } = testSeederUserDTO.createUserDto();

      const result = await authService.registrationUser({
        login,
        email,
        password,
      });

      expect(result.status).toBe(ResultStatus.Success);
    
    });

    it("should not register user twice", async () => {
      const { login, email, password } = testSeederUserDTO.createUserDto();
      await testSeederUserDTO.insertUser({ login, email, password });

      const result = await authService.registrationUser({
        login,
        email,
        password,
      });

      expect(result.status).toBe(ResultStatus.BadRequest);
    });
  });

  describe("Confirm email", () => {
    it("should not confirm email if user does not exist", async () => {
      const result = await authService.confirmEmail("pam-param");

      expect(result.status).toBe(ResultStatus.BadRequest);
    });

   it("should not confirm email which is confirmed", async () => {
      const { login, email, password } = testSeederUserDTO.createUserDto();
      const user = await testSeederUserDTO.insertUser({ login, email, password, isConfirmed: true  });
      
      const result = await authService.confirmEmail(user.emailConfirmation.confirmationCode!);
      
      expect(result.status).toBe(ResultStatus.BadRequest);
      expect(result.extensions?.[0].field).toBe('code')
    });

     it("should not confirm email with expired code", async () => {
      const { login, email, password } = testSeederUserDTO.createUserDto();
      const user = await testSeederUserDTO.insertUser({ login, email, password, expirationDate: new Date(Date.now() - 1000)});
      
      const result = await authService.confirmEmail(user.emailConfirmation.confirmationCode!);
      
      expect(result.status).toBe(ResultStatus.BadRequest);
      expect(result.extensions?.[0].field).toBe('code')
    });

    it('confirm user', async () => {
      const { login, email, password } = testSeederUserDTO.createUserDto();
      const user = await testSeederUserDTO.insertUser({ login, email, password});

      const result = await authService.confirmEmail(user.emailConfirmation.confirmationCode!);
      expect(result.status).toBe(ResultStatus.Success);

      const userUpdateIsConfirm = await userRepo.findById(user.id);
      expect(userUpdateIsConfirm?.emailConfirmation.isConfirmed).toBeTruthy();
    });
  });

});
