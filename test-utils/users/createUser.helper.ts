import { ADMIN_PASSWORD, ADMIN_USERNAME } from "../../src/auth/guard/super-admin.guard-middleware";
import { AUTH_PATH, USERS_PATH } from "../../src/common/paths/path";
import { HttpStatus } from "../../src/common/types/http.status";
import { CreateUserDto } from "../../src/users/domain/types/dto/create.user.dto"; 
import { IUserView } from "../../src/users/domain/types/viewModel/user.view.interface"; 
import request from "supertest";
import { Express } from 'express'




//использую в ауз - логин и регистрации
export const createUser = async (app: Express, dto: CreateUserDto, expectedStatus: HttpStatus = HttpStatus.CREATED): Promise<IUserView> => {

  const res = await request(app)
              .post(USERS_PATH)
              .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
              .send(dto)
              .expect(expectedStatus)
              return res.body
}

export const registrationUser = async (app: Express, dto: CreateUserDto, expectedStatus: HttpStatus = HttpStatus.NO_CONTENT): Promise<void> => {

              await request(app)
              .post(`${AUTH_PATH}/registration`)
              .send(dto)
              .expect(expectedStatus)           
}
