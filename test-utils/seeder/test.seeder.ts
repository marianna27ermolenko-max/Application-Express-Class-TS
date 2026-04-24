import { add } from "date-fns";
import { randomUUID } from "crypto";
import { userCollection } from "../../src/db/mongo.db";
import { BcryptService } from "../../src/auth/adapters/bcrypt.service";
import { container } from "../../src/composition-root";

let room;
let bcryptService: BcryptService;


export type  RegisterUserResultType = {

  id: string;
  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
  },

  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  },

   recoveryCode: {
    confirmationCode: string | null;
    expirationDate: Date | null;
   }
}

type RegisterUserPayloadType = {
  login: string;
  email: string; 
  password: string;  
  code?: string; 
  expirationDate?: Date,
  isConfirmed?: boolean;
  expirationDateRec?: string; 
  expirationDateRes?: Date; 
  
}

//подготовка днных для тестов 
export const testSeederUserDTO = {
  createUserDto() {
    return {
      login: "testing",
      email: "test@gmail.com",
      password: "123456789",
    };
  },

  createUserDtos(count: number) {
    const users = [];

    for (let i = 0; i < count; i++) {
      users.push({
        login: "test" + i,
        email: `test${i}@gmail.com`,
        password: "123456789",
      });
    }

    return users;
  },
   
  //метод который возвращает целый созданный обьект обьект
  async insertUser({login, email, password, code, expirationDate, isConfirmed, expirationDateRec, expirationDateRes }:RegisterUserPayloadType): Promise<RegisterUserResultType> {
     room = container;
    bcryptService = room.resolve(BcryptService);
    const passwordHash = await bcryptService.generationHash(password);

    const newUser = {
    accountData: {
    login,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  },
  emailConfirmation: {
    confirmationCode: code ?? randomUUID(),
    expirationDate: expirationDate ?? add(new Date(), { hours: 1, minutes: 30 }),
    isConfirmed: isConfirmed ?? false,
    },
   recoveryCode: {
    confirmationCode: expirationDateRec ?? null,
    expirationDate: expirationDateRes ?? null
   } 
  }

  const user = await userCollection.insertOne({...newUser})

  return {
    id: user.insertedId.toString(),
    ...newUser
  }

  }
}


