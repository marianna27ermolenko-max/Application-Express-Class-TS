import { HttpStatus } from "../../common/types/http.status";
import { usersRepository } from "../../users/infrastructure/user.repository";
import { bcryptService } from "../adapters/bcrypt.service";



export const authServer = {

async loginUser(loginOrEmail: string, password: string): Promise<{ accessToken: string } | null>{

const isCorrectCredentials = await this.checkUserCredentials(loginOrEmail, password);

 if(!isCorrectCredentials) return null;   //Ошибка входа 

  return { accessToken: "token" };       //возвращаемое значение при успешной авторизации.
},

      //проверяем правельные ли логин и пароль, если да, то выше выдаем токен доступа
async checkUserCredentials(loginOrEmail: string, password: string): Promise<boolean>{
 const user = await usersRepository.findByLoginOrEmail(loginOrEmail);

 if(!user) return false;

return bcryptService.checkPassword(password, user.passwordHash);
},

}