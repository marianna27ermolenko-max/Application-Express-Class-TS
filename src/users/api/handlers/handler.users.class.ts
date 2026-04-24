import { Response } from "express";
import { CreateUserDto } from "../../types/create.user.dto";
import { HttpStatus } from "../../../common/types/http.status";
import { UsersService } from "../../domain/users.service";
import { UsersQwRepository } from "../../infrastructure/user.query.repository";
import { RequestWithBody, RequestWithParams, RequestWithQuery } from "../../../common/types/requests";
import { IUserView } from "../../types/user.view.interface";
import { IdType } from "../../../common/types/id";
import { setDefaultUserSortAndPagination } from "../../../common/helpers/set-default-user-sort-and-pagination";
import { UserSortFields } from "./input/user-sort-field";
import { matchedData } from "express-validator";
import { UsersQueryFieldsType } from "../../types/users.query.Fields.type";
import { inject, injectable } from "inversify";

@injectable()
export class UsersController {

  usersService: UsersService;
  usersQwRepo: UsersQwRepository;

  constructor(@inject(UsersService) usersService: UsersService, @inject(UsersQwRepository) usersQwRepo: UsersQwRepository){
    
   this.usersService = usersService;
   this.usersQwRepo = usersQwRepo;

  }


     async createUserHandler(req: RequestWithBody<CreateUserDto>, res: Response<IUserView>){
    
        try {
    
        const { login, password, email } = req.body;
        const userId = await this.usersService.createUserThroughtAdmin({ login, password, email });
    
        const newUser = await this.usersQwRepo.findUserById(userId);
    
        res.status(HttpStatus.CREATED).json(newUser!);
    
    }catch(e: any){
    
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    }

      async  deleteUserHandler(
      req: RequestWithParams<IdType>,
      res: Response<string>,
    ) {
      try {
        const user = await this.usersService.deleteUser(req.params.id);
        if (!user) return res.sendStatus(HttpStatus.NOT_FOUND);
    
        return res.sendStatus(HttpStatus.NO_CONTENT);
      } catch (e: unknown) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

      async getUsersHandler(req: RequestWithQuery<UsersQueryFieldsType>, res: Response){
    
         try {
    
           const sanitizedQuery = matchedData<UsersQueryFieldsType>(req, {
             locations: ['query'], // - "Бери данные только из req.query"
             includeOptionals: true, // -Верни даже необязательные поля, если они есть
           });
           
           const  pageNumber = Number(sanitizedQuery.pageNumber);  //УДАЛИТЬ
           const  pageSize = Number(sanitizedQuery.pageSize);
    
           const pagination = setDefaultUserSortAndPagination<UserSortFields>({
            ...sanitizedQuery,
            pageNumber,
            pageSize,
         });
         
          const listUsers = await this.usersQwRepo.findAllUsers(pagination);
          
          res.status(HttpStatus.OK).json(listUsers)
    
           }catch(e: unknown){
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
           }
    }
}

