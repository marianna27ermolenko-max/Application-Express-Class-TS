import mongoose, { HydratedDocument, model, Model } from "mongoose";
import { CreateUserDtoService } from "./types/dto/create.user.dto";
import { USERS_COLLECTION_NAME } from "../../db/mongo.db";

export interface User {

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

export class UserEntity{

    private constructor(
    public accountData: {
      login: string;
      email: string;
      passwordHash: string;
      createdAt: string;
    },

    public emailConfirmation: {
      confirmationCode: string | null;
      expirationDate: Date | null;
      isConfirmed: boolean;
    },

    public recoveryCode: {
      confirmationCode: string | null;
      expirationDate: Date | null;
    }
  ) {}

  static createUserAdmin(dto: CreateUserDtoService){
    const user = new UserModel({
      accountData: {
        login: dto.login,
        email: dto.email,
        passwordHash: dto.passwordHash,
        createdAt: new Date().toISOString(),
      },

      emailConfirmation: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      },

      recoveryCode: {
        confirmationCode: null,
        expirationDate: null,
      },
    });

    return user;
  } 

  static createUser(dto: CreateUserDtoService){
       const user = new UserModel({
      accountData: {
        login: dto.login,
        email: dto.email,
        passwordHash: dto.passwordHash,
        createdAt: new Date().toISOString(),
      },

      emailConfirmation: {
        confirmationCode: dto.confirmationCode ?? null,
        expirationDate: dto.expirationDate ?? null,
        isConfirmed: false,
      },

      recoveryCode: {
        confirmationCode: null,
        expirationDate: null,
      },
    });

    return user;
  } 

  confirmEmail(this: UserDocument){

    if(this.emailConfirmation.isConfirmed){
    throw new Error('Code already confirmed');
    }

    if (!this.emailConfirmation.expirationDate || this.emailConfirmation.expirationDate < new Date()) {
       throw new Error('Code expired');
    }

    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.confirmationCode = null;
    this.emailConfirmation.expirationDate = null;
  }

  refreshConfirmationCode(this: UserDocument, code: string, expirationDate: Date){

    if(this.emailConfirmation.isConfirmed){
      throw new Error('Code already confirmed')
    }

      this.emailConfirmation.confirmationCode = code;
      this.emailConfirmation.expirationDate = expirationDate;
  }

  recoveryPassword(this: UserDocument, code: string, expirationDate: Date){

      this.recoveryCode.confirmationCode = code;
      this.recoveryCode.expirationDate = expirationDate;
  }

  updatePassword(this: UserDocument, newPasswordHash: string){
    if(!this.recoveryCode.expirationDate || this.recoveryCode.expirationDate < new Date()){
      throw new Error('Code expired')
    }

    this.accountData.passwordHash = newPasswordHash;
    this.recoveryCode.confirmationCode = null;
    this.recoveryCode.expirationDate = null;
  }
 
  }

  
 export interface UserMethods{ 
 confirmEmail(): void;
 refreshConfirmationCode(code: string, expirationDate: Date): void;
 recoveryPassword(code: string, expirationDate: Date): void;
 updatePassword(newPasswordHash: string): void;
 };


export type UserStatics = typeof UserEntity; 
export type UserModelType = Model<User, {}, UserMethods> & UserStatics;
export type UserDocument = HydratedDocument<User, UserMethods>;                                       //это тип инстанса этого класса - Это тип документа - того, что возвращает Mongoose - он вкл.поля(ts) и методы mongoose(save())     

export const UserSchema = new mongoose.Schema<User, UserModelType, UserMethods>(
  {
 accountData: {
    login: { type: String, required: true, minlength: 3, maxlength: 10, unique: true},
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true},
  },
  emailConfirmation: {
    confirmationCode: { type: String, default: null },                
    expirationDate: { type: Date, default: null },
    isConfirmed: { type: Boolean, default: false, required: true},  
  },
  recoveryCode: { 
    confirmationCode: { type: String, default: null },                                       
    expirationDate: { type: Date, default: null },
  }
  }
)

UserSchema.loadClass(UserEntity)  //связываем доменный класс со схемой
       
export const UserModel = model<User, UserModelType>(USERS_COLLECTION_NAME, UserSchema);





/*model<UserAccountDbType, UserModel> = 
UserAccountDbType - тип данных (что внутри документа)
UserModel - тип самой модели (методы типа .find, .create)*/