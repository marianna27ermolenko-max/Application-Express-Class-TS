import { Response } from "express";
import { HttpStatus } from "../../../common/types/http.status";
import { RequestWithQuery } from "../../../common/types/requests";
import { UsersQueryFieldsType } from "../../types/users.query.Fields.type";
import { matchedData } from "express-validator";
import { setDefaultUserSortAndPagination } from "../../../common/helpers/set-default-user-sort-and-pagination";
import { UserSortFields } from "./input/user-sort-field";
import { usersQwRepository } from "../../infrastructure/user.query.repository";

export async function getUsersHandler(req: RequestWithQuery<UsersQueryFieldsType>, res: Response){

     try {

       const sanitizedQuery = matchedData<UsersQueryFieldsType>(req, {
         locations: ['query'], // - "Бери данные только из req.query"
         includeOptionals: true, // -Верни даже необязательные поля, если они есть
       });

       console.log(sanitizedQuery);
       
       
       const  pageNumber = Number(sanitizedQuery.pageNumber);  //УДАЛИТЬ
       const  pageSize = Number(sanitizedQuery.pageSize);

       const pagination = setDefaultUserSortAndPagination<UserSortFields>({
        ...sanitizedQuery,
        pageNumber,
        pageSize,
     });

     console.log(pagination);
     

        const listUsers = await usersQwRepository.findAllUsers(pagination);

      console.log(listUsers);  

        res.status(HttpStatus.OK).json(listUsers)

       }catch(e: unknown){
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
       }
};