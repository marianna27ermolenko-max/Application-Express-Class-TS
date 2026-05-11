import { AUTH_PATH } from "../../src/common/paths/path";
import { HttpStatus } from "../../src/common/types/http.status";
import { CreateUserDto } from "../../src/users/domain/types/dto/create.user.dto"; 
import { testSeederUserDTO } from "../seeder/test.seeder";
import request from "supertest";
import { Express } from "express";

export const registerAndConfirmUser = async (app: Express, dto: CreateUserDto) => {

const user = await testSeederUserDTO.insertUser(dto);

await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({code: user.emailConfirmation.confirmationCode})
      .expect(HttpStatus.NO_CONTENT)
}