import { CreateUserDto } from "../types/create.user.dto";
import { BcryptService } from "../../auth/adapters/bcrypt.service";
import { UsersRepository } from "../infrastructure/user.repository";
import { UserAccountDbType } from "../../auth/types/user.account.db.type";
import { inject, injectable } from "inversify";

@injectable()
export class UsersService {
  
  usersRepo: UsersRepository;
  bcryptService: BcryptService;

  constructor(@inject(UsersRepository) usersRepo: UsersRepository, @inject(BcryptService) bcryptService: BcryptService){
    this.usersRepo = usersRepo;
    this.bcryptService = bcryptService;
  }
  
   async createUserThroughtAdmin(dto: CreateUserDto): Promise<string> {
    const { login, password, email } = dto;

    const existingLogin = await this.usersRepo.findByLogin(login);
    if (existingLogin) {
      throw { message: "Login already exists", field: "login" };
    }

    const existingEmail = await this.usersRepo.findByEmail(email);
    if (existingEmail) {
      throw { message: "Email already exists", field: "email" };
    }

    const passwordHash = await this.bcryptService.generationHash(password);

    const newUser: UserAccountDbType = {
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },

      emailConfirmation: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      },
    };

    const newUserId = await this.usersRepo.createUserAdmin(newUser);

    return newUserId;
  }

   async deleteUser(id: string): Promise<boolean> {
    const user = await this.usersRepo.findById(id);
    if (!user) return false;

    return await this.usersRepo.deleteUser(id);
  }
};


