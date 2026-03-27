//здесь создаем генерацию пользователей для проверки тестов - именно вхлдящие данные и уже с этими данными массив пользователей

import { CreateUserDto } from "../../../../src/users/types/create.user.dto"


export const testingDtosCreator = {
    
                                                   //генерируеи данные входящие от пользователя для его регистрации 
    createUserDto({login, password, email}: 
    {login?: string, password?: string, email?: string,}): CreateUserDto{
         return {
          login: login ?? 'testUser',
          password: password ?? 'user123',
          email: email ?? 'maryincubator@mail.ru',
         }
    }, 
                                                    //в этом методе генрируеим необходимое колличество пользователей
    createUsers(count: number): CreateUserDto[]{
     const user = [];

        for(let i = 0; i < count; i++){

          user.push({
            login: 'testUser' + i,
            password: `user123${i}`,
            email: 'maryincubator@mail.ru'          //это если нам не надо подтверждать почту - а если надо??
        })
        }
        return user;
    }

}