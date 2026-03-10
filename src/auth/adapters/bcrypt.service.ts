import bcrypt from 'bcrypt';

export const bcryptService = {

    async generationHash(password: string){

       const saltRounds = 10;
       const passwordSalt = await bcrypt.genSalt(saltRounds);

       return bcrypt.hash(password, passwordSalt);
    },

    async checkPassword(password: string, hash: string){
    return bcrypt.compare(password, hash); //Проверка пароля по хэшу
    },
}

