// import mongoose from "mongoose";
// import { UserAccountDbType } from "../types/IUserAccountDbType";

// export const UserSchema = new mongoose.Schema<UserAccountDbType>(
//   {
//  accountData: {
//     login: { type: String, required: true, minlength: 3, maxlength: 10, unique: true},
//     email: { type: String, required: true, unique: true },
//     passwordHash: { type: String, required: true },
//     createdAt: { type: String, required: true},
//   },

//   emailConfirmation: {
//     confirmationCode: { type: String, default: null },                
//     expirationDate: { type: Date, default: null },
//     isConfirmed: { type: Boolean, default: false, required: true},  
//   },
//   recoveryCode: { 
//     confirmationCode: { type: String, default: null },                                       
//     expirationDate: { type: Date, default: null },
//   }
//   }
// ) 