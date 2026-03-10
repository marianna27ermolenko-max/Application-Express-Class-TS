import { CreateUserDto } from "../types/create.user.dto";
import { IUserBD } from "../types/user.db.interface";
import { bcryptService } from "../../auth/adapters/bcrypt.service";
import { usersRepository } from "../infrastructure/user.repository";

export const usersService = {
  async createUser(dto: CreateUserDto): Promise<string> {

    const { login, password, email } = dto;

  const existingLogin = await usersRepository.findByLogin(login);
  if (existingLogin) {
    throw { message: "Login already exists", field: "login" };
  }

  const existingEmail = await usersRepository.findByEmail(email);
  if (existingEmail) {
   throw { message: "Email already exists", field: "email" };
  }

    const passwordHash = await bcryptService.generationHash(password);

    const newUser: IUserBD = {
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    const newUserId = await usersRepository.createUser(newUser);

    console.log(newUserId);

    return newUserId;
  },

  async deleteUser(id: string): Promise<boolean> {
    const user = await usersRepository.findById(id);
    if (!user) return false;

    return await usersRepository.deleteUser(id);
  },
};
