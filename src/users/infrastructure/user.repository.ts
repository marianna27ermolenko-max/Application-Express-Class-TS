import { injectable } from "inversify";
import { UserDocument, UserModel } from "../domain/users.entity";



@injectable()
export class UsersRepository {

  async save(user: UserDocument): Promise<void>{
    await user.save();
  }

  async findById(id: string): Promise<UserDocument | null>{
    return await UserModel.findById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleteUser = await UserModel.deleteOne({ _id: id });
    return deleteUser.deletedCount === 1;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null>{

    return await UserModel.findOne({
      $or: [ { "accountData.login": loginOrEmail }, { "accountData.email": loginOrEmail } ]
    });
  }
  
  async findByLogin(login: string): Promise<UserDocument | null> {
    return await UserModel.findOne({ "accountData.login": login });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const result = await UserModel.findOne({ "accountData.email": email });
    return result;
  }

  async findUserByConfirmationCode(
    code: string,
  ): Promise<UserDocument | null> {
    const user = await UserModel.findOne({
      "emailConfirmation.confirmationCode": code,
    });
    if (!user) return null;
    return user;
  }
  
  async checkRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
    const result =  await UserModel.findOne({'recoveryCode.confirmationCode': recoveryCode});
    if(!result) return null;
    return result;
  }

};



