import { Response } from "express";
import { CreateUserDto } from "../../types/create.user.dto";
import { HttpStatus } from "../../../common/types/http.status";
import { usersService } from "../../domain/users.service";
import { usersQwRepository } from "../../infrastructure/user.query.repository";
import { RequestWithBody } from "../../../common/types/requests";
import { IUserView } from "../../types/user.view.interface";

export async function createUserHandler(req: RequestWithBody<CreateUserDto>, res: Response<IUserView>){

    try {

    const { login, password, email } = req.body;
    const userId = await usersService.createUser({ login, password, email });

    const newUser = await usersQwRepository.findById(userId);

    res.status(HttpStatus.CREATED).json(newUser!);

}catch(e: any){

    console.error(e)

    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}
};