// import { HydratedDocument, model, Model } from "mongoose";
// import { UserAccountDbType } from "../types/IUserAccountDbType";
// import { USERS_COLLECTION_NAME } from "../../../db/mongo.db";
// import { UserSchema } from "../schema/schema.users";
// import { UserEntity, UserMethods, UserStatics } from "../users.entity";

            
// type UserModelType = Model<UserAccountDbType, {}, UserMethods & UserStatics>;                               //это тип для самой модели 
// export type UserDocument = HydratedDocument<UserAccountDbType, UserMethods>;             //это тип инстанса этого класса - Это тип документа - того, что возвращает Mongoose - он вкл.поля(ts) и методы mongoose(save()) 

// UserSchema.loadClass(UserEntity)

// export const UserModel = model<UserAccountDbType, UserModelType>(USERS_COLLECTION_NAME, UserSchema);        //Mongoose: берёт Schema - создаёт “класс” -привязывает к коллекции





/*model<UserAccountDbType, UserModel> = 
UserAccountDbType - тип данных (что внутри документа)
UserModel - тип самой модели (методы типа .find, .create)*/