import { CreateUserDto } from "../domain/types/dto/create.user.dto"; 
import { BcryptService } from "../../auth/adapters/bcrypt.service";
import { UsersRepository } from "../infrastructure/user.repository";
import { UserModel } from "../domain/users.entity"; 
import { inject, injectable } from "inversify";
import { Result } from "../../common/result/result.type";
import { ResultStatus } from "../../common/result/resultCode";

@injectable()
export class UsersService {
  
  private usersRepo: UsersRepository;
  bcryptService: BcryptService;

  constructor(@inject(UsersRepository) usersRepo: UsersRepository, @inject(BcryptService) bcryptService: BcryptService){
    this.usersRepo = usersRepo;
    this.bcryptService = bcryptService;
  }
  
   async createUserThroughtAdmin(dto: CreateUserDto): Promise<Result<string | null>> {
    const { login, password, email } = dto;

    const existingLogin = await this.usersRepo.findByLogin(login);  
    if (existingLogin) {
       return {
             status: ResultStatus.BadRequest,
             errorMessage: "Bad Request",
             extensions: [{ field: "login", message: "Login already exists" }],
             data: null,
           }

      // throw { message: "Login already exists", field: "login" };
    }


    const existingEmail = await this.usersRepo.findByEmail(email);  
    if (existingEmail) {
      return {
             status: ResultStatus.BadRequest,
             errorMessage: "Bad Request",
             extensions: [{ field: "email", message: "Email already exists" }],
             data: null,
           }

      // throw { message: "Email already exists", field: "email" };
    }

    const passwordHash = await this.bcryptService.generationHash(password);
    const dtoCreate = {login, email, passwordHash}

    const newUser = UserModel.createUserAdmin(dtoCreate); 

    await this.usersRepo.save(newUser);

    return {
             status: ResultStatus.Success,
             extensions: [],
             data: newUser._id.toString(),
           }

    // return newUser._id.toString();
  }


   async deleteUser(id: string): Promise<boolean> {

    const user = await this.usersRepo.findById(id);
    if (!user) return false;

    return await this.usersRepo.deleteUser(id);
  }
};


